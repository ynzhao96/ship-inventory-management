import { Router } from 'express';
import { ok, fail, asyncHandler, q, withTransaction, addLog } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

/**
 * Body 约定：
 * {
 *   operation: 'INSERT' | 'UPDATE' | 'DELETE',
 *   item: {
 *     itemId: string,
 *     itemName?: string,
 *     itemNameEn?: string,
 *     unit?: string,
 *     specification?: string,
 *     categoryId?: string | number
 *   },
 *   force?: boolean  // 可选：DELETE 时是否强制删除（会连 inventory 一并清理）
 * }
 */
router.post('/updateItem', asyncHandler(async (req, res) => {
  const { item = {}, operation, force = false } = req.body ?? {};
  const op = operation;

  if (!['INSERT', 'UPDATE', 'DELETE'].includes(op)) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'operation 必须是 INSERT / UPDATE / DELETE' });
  }

  // 统一取值 & 清洗
  const toStr = (v) => (v === undefined || v === null ? '' : String(v).trim());
  const itemId = toStr(item.itemId);
  const itemName = item.itemName !== undefined ? toStr(item.itemName) : undefined;
  const itemNameEn = item.itemNameEn !== undefined ? toStr(item.itemNameEn) : undefined;
  const unit = item.unit !== undefined ? toStr(item.unit) : undefined;
  const specification = item.specification !== undefined ? toStr(item.specification) : undefined;
  const categoryId = item.categoryId !== undefined ? item.categoryId : undefined;

  // 文案
  const msgMap = {
    INSERT: '创建物料成功',
    UPDATE: '更新物料成功',
    DELETE: '删除物料成功',
  };

  if (op === 'INSERT') {
    // 必填校验
    if (!itemId || !itemName || categoryId === undefined || categoryId === null || categoryId === '') {
      return fail(res, 400, { code: 'BAD_REQUEST', message: 'INSERT 需要提供 itemId、itemName、categoryId' });
    }

    // 事务：避免并发插入问题
    const created = await withTransaction(async (conn) => {
      // 唯一性检查
      const dup = await q('SELECT 1 FROM items WHERE item_id = ?', [itemId], conn);
      if (dup?.length) {
        return fail(res, 409, { code: 'DUPLICATE', message: `物料 ${itemId} 已存在` });
      }

      await q(
        `INSERT INTO items
           (item_id, item_name, item_name_en, unit, specification, category_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          itemName,
          itemNameEn || null,
          unit,
          specification || null,
          categoryId
        ],
        conn
      );

      try {
        await addLog?.(conn, {
          module: 'items',
          action: 'insert',
          remark: `itemId=${itemId}`,
          payload: JSON.stringify({ item })
        });
      } catch { }

      // 回读
      const [row] = await q(
        `SELECT item_id AS itemId, item_name AS itemName, item_name_en AS itemNameEn,
                unit, specification, category_id AS categoryId
           FROM items WHERE item_id = ?`,
        [itemId],
        conn
      );
      return row;
    });

    if (created?.success === false) return; // 上面 fail() 已响应
    return ok(res, { data: { affected: 1, item: created } }, { message: msgMap[op] });
  }

  if (op === 'UPDATE') {
    if (!itemId) {
      return fail(res, 400, { code: 'BAD_REQUEST', message: 'UPDATE 需要提供 item.itemId' });
    }

    // 动态拼接要更新的字段（只更新传入的字段）
    const sets = [];
    const args = [];
    if (itemName !== undefined) { sets.push('item_name = ?'); args.push(itemName); }
    if (itemNameEn !== undefined) { sets.push('item_name_en = ?'); args.push(itemNameEn || null); }
    if (unit !== undefined) { sets.push('unit = ?'); args.push(unit); }
    if (specification !== undefined) { sets.push('specification = ?'); args.push(specification || null); }
    if (categoryId !== undefined) { sets.push('category_id = ?'); args.push(categoryId); }

    if (sets.length === 0) {
      return fail(res, 400, { code: 'NO_CHANGES', message: '未提供需要更新的字段' });
    }

    const updated = await withTransaction(async (conn) => {
      const exists = await q('SELECT 1 FROM items WHERE item_id = ?', [itemId], conn);
      if (!exists?.length) {
        return fail(res, 404, { code: 'NOT_FOUND', message: `物料 ${itemId} 不存在` });
      }

      await q(`UPDATE items SET ${sets.join(', ')} WHERE item_id = ?`, [...args, itemId], conn);

      try {
        await addLog?.(conn, {
          module: 'items',
          action: 'update',
          remark: `itemId=${itemId}`,
          payload: JSON.stringify({ item })
        });
      } catch { }

      const [row] = await q(
        `SELECT item_id AS itemId, item_name AS itemName, item_name_en AS itemNameEn,
                unit, specification, category_id AS categoryId
           FROM items WHERE item_id = ?`,
        [itemId],
        conn
      );
      return row;
    });

    if (updated?.success === false) return;
    return ok(res, { data: { affected: 1, item: updated } }, { message: msgMap[op] });
  }

  // DELETE
  if (!itemId) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'DELETE 需要提供 item.itemId' });
  }

  const result = await withTransaction(async (conn) => {
    // 存在性检查
    const exists = await q('SELECT 1 FROM items WHERE item_id = ?', [itemId], conn);
    if (!exists?.length) {
      return fail(res, 404, { code: 'NOT_FOUND', message: `物料 ${itemId} 不存在` });
    }

    // 引用检查（inventory）
    const [{ cnt }] = await q(
      'SELECT COUNT(1) AS cnt FROM inventory WHERE item_id = ?',
      [itemId],
      conn
    );

    if (Number(cnt) > 0 && !force) {
      return fail(res, 409, {
        code: 'IN_USE',
        message: `物料 ${itemId} 正被库存引用，无法删除。可先清理 inventory 或传 force=true 强制删除。`,
        details: { inventoryCount: Number(cnt) }
      });
    }

    // 如需强制，先清理 inventory（按需可扩展到 inbounds/outbounds/claims 等）
    if (Number(cnt) > 0 && force) {
      await q('DELETE FROM inventory WHERE item_id = ?', [itemId], conn);
    }

    const ret = await q('DELETE FROM items WHERE item_id = ?', [itemId], conn);

    try {
      await addLog?.(conn, {
        module: 'items',
        action: 'delete',
        remark: `itemId=${itemId}, force=${!!force}`,
        payload: JSON.stringify({ item })
      });
    } catch { }

    return { affected: ret?.affectedRows ?? 0 };
  });

  if (result?.success === false) return;
  return ok(res, { data: result }, { message: msgMap[op] });
}));

export default router;
