import { Router } from 'express';
import { ok, fail, asyncHandler, q, withTransaction, addLog } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

/**
 * Body 约定：
 * {
 *   operation: 'INSERT' | 'UPDATE' | 'DELETE',
 *   category: {
 *     categoryId: string,
 *     categoryName?: string,
 *     categoryNameEn?: string,
 *   },
 * }
 */
router.post('/updateCategory', asyncHandler(async (req, res) => {
  const { category = {}, operation } = req.body ?? {};
  const op = operation;

  if (!['INSERT', 'UPDATE', 'DELETE'].includes(op)) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'operation 必须是 INSERT / UPDATE / DELETE' });
  }

  // 统一取值 & 清洗
  const toStr = (v) => (v === undefined || v === null ? '' : String(v).trim());
  const categoryId = toStr(category.categoryId);
  const categoryName = category.categoryName !== undefined ? toStr(category.categoryName) : undefined;
  const categoryNameEn = category.categoryNameEn !== undefined ? toStr(category.categoryNameEn) : undefined;

  // 文案
  const msgMap = {
    INSERT: '创建物料类别成功',
    UPDATE: '更新物料类别成功',
    DELETE: '删除物料类别成功',
  };

  if (op === 'INSERT') {
    // 必填校验
    if (!categoryId || !categoryName || !categoryNameEn) {
      return fail(res, 400, { code: 'BAD_REQUEST', message: 'INSERT 需要提供 categoryId、categoryName、categoryNameEn' });
    }

    // 事务：避免并发插入问题
    const created = await withTransaction(async (conn) => {
      // 唯一性检查
      const dup = await q('SELECT 1 FROM categories WHERE id = ?', [categoryId], conn);
      if (dup?.length) {
        return fail(res, 409, { code: 'DUPLICATE', message: `物料类别 ${categoryId} 已存在` });
      }

      await q(
        `INSERT INTO categories
           (id, name, name_en)
         VALUES (?, ?, ?)`,
        [
          categoryId,
          categoryName,
          categoryNameEn || null,
        ],
        conn
      );

      try {
        await addLog?.(conn, {
          module: 'categories',
          action: 'insert',
          remark: `categoryId=${categoryId}`,
          payload: JSON.stringify({ category })
        });
      } catch { }

      // 回读
      const [row] = await q(
        `SELECT id AS categoryId, name AS categoryName, name_en AS categoryNameEn
           FROM categories WHERE id = ?`,
        [categoryId],
        conn
      );
      return row;
    });

    if (created?.success === false) return; // 上面 fail() 已响应
    return ok(res, { data: { affected: 1, category: created } }, { message: msgMap[op] });
  }

  if (op === 'UPDATE') {
    if (!categoryId || !categoryName || !categoryNameEn) {
      return fail(res, 400, { code: 'BAD_REQUEST', message: 'UPDATE 需要提供 categoryId、categoryName、categoryNameEn' });
    }

    // 动态拼接要更新的字段（只更新传入的字段）
    const sets = [];
    const args = [];
    if (categoryId !== undefined) { sets.push('id = ?'); args.push(categoryId); }
    if (categoryName !== undefined) { sets.push('name = ?'); args.push(categoryName); }
    if (categoryNameEn !== undefined) { sets.push('name_en = ?'); args.push(categoryNameEn || null); }

    if (sets.length === 0) {
      return fail(res, 400, { code: 'NO_CHANGES', message: '未提供需要更新的字段' });
    }

    const updated = await withTransaction(async (conn) => {
      const exists = await q('SELECT 1 FROM categories WHERE id = ?', [categoryId], conn);
      if (!exists?.length) {
        return fail(res, 404, { code: 'NOT_FOUND', message: `物料类别 ${categoryId} 不存在` });
      }

      await q(`UPDATE categories SET ${sets.join(', ')} WHERE id = ?`, [...args, categoryId], conn);

      try {
        await addLog?.(conn, {
          module: 'categories',
          action: 'update',
          remark: `categoryId=${categoryId}`,
          payload: JSON.stringify({ category })
        });
      } catch { }

      const [row] = await q(
        `SELECT id AS categoryId, name AS categoryName, name_en AS categoryNameEn
           FROM categories WHERE id = ?`,
        [categoryId],
        conn
      );
      return row;
    });

    if (updated?.success === false) return;
    return ok(res, { data: { affected: 1, category: updated } }, { message: msgMap[op] });
  }

  // DELETE
  if (!categoryId) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'DELETE 需要提供 category.categoryId' });
  }

  const result = await withTransaction(async (conn) => {
    // 存在性检查
    const exists = await q('SELECT 1 FROM categories WHERE id = ?', [categoryId], conn);
    if (!exists?.length) {
      return fail(res, 404, { code: 'NOT_FOUND', message: `物料类别 ${categoryId} 不存在` });
    }

    const ret = await q('DELETE FROM categories WHERE id = ?', [categoryId], conn);

    try {
      await addLog?.(conn, {
        module: 'categories',
        action: 'delete',
        remark: `categoryId=${categoryId}`,
        payload: JSON.stringify({ category })
      });
    } catch { }

    return { affected: ret?.affectedRows ?? 0 };
  });

  if (result?.success === false) return;
  return ok(res, { data: result }, { message: msgMap[op] });
}));

export default router;
