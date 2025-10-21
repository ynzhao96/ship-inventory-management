import { Router } from 'express';
import { ok, fail, asyncHandler, q, withTransaction, addLog } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

/**
 * Body 约定：
 * {
 *   operation: 'INSERT' | 'UPDATE' | 'DELETE',
 *   ship: {
 *     shipId: string,
 *     shipName?: string,
 *     shipType?: string,
 *   },
 * }
 */
router.post('/updateShip', asyncHandler(async (req, res) => {
  const { ship = {}, operation } = req.body ?? {};
  const op = operation;

  if (!['INSERT', 'UPDATE', 'DELETE'].includes(op)) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'operation 必须是 INSERT / UPDATE / DELETE' });
  }

  // 统一取值 & 清洗
  const toStr = (v) => (v === undefined || v === null ? '' : String(v).trim());
  const shipId = toStr(ship.shipId);
  const shipName = ship.shipName !== undefined ? toStr(ship.shipName) : undefined;
  const shipType = ship.shipType !== undefined ? toStr(ship.shipType) : undefined;

  // 文案
  const msgMap = {
    INSERT: '创建船舶成功',
    UPDATE: '更新船舶成功',
    DELETE: '删除船舶成功',
  };

  if (op === 'INSERT') {
    // 必填校验
    if (!shipId || !shipName || !shipType) {
      return fail(res, 400, { code: 'BAD_REQUEST', message: 'INSERT 需要提供 shipId、shipName、shipType' });
    }

    // 事务：避免并发插入问题
    const created = await withTransaction(async (conn) => {
      // 唯一性检查
      const dup = await q('SELECT 1 FROM ships WHERE id = ?', [shipId], conn);
      if (dup?.length) {
        return fail(res, 409, { code: 'DUPLICATE', message: `船舶 ${shipId} 已存在` });
      }

      await q(
        `INSERT INTO ships
           (id, name, type)
         VALUES (?, ?, ?)`,
        [
          shipId,
          shipName,
          shipType || null,
        ],
        conn
      );

      try {
        // await addLog?.(conn, {
        //   module: 'ships',
        //   action: 'insert',
        //   remark: `shipId=${shipId}`,
        //   payload: JSON.stringify({ ship })
        // });
      } catch { }

      // 回读
      const [row] = await q(
        `SELECT id AS shipId, name AS shipName, type AS shipType
           FROM ships WHERE id = ?`,
        [shipId],
        conn
      );
      return row;
    });

    if (created?.success === false) return; // 上面 fail() 已响应
    return ok(res, { data: { affected: 1, ship: created } }, { message: msgMap[op] });
  }

  if (op === 'UPDATE') {
    if (!shipId || !shipName || !shipType) {
      return fail(res, 400, { code: 'BAD_REQUEST', message: 'UPDATE 需要提供 shipId、shipName、shipType' });
    }

    // 动态拼接要更新的字段（只更新传入的字段）
    const sets = [];
    const args = [];
    if (shipId !== undefined) { sets.push('id = ?'); args.push(shipId); }
    if (shipName !== undefined) { sets.push('name = ?'); args.push(shipName); }
    if (shipType !== undefined) { sets.push('type = ?'); args.push(shipType || null); }

    if (sets.length === 0) {
      return fail(res, 400, { code: 'NO_CHANGES', message: '未提供需要更新的字段' });
    }

    const updated = await withTransaction(async (conn) => {
      const exists = await q('SELECT 1 FROM ships WHERE id = ?', [shipId], conn);
      if (!exists?.length) {
        return fail(res, 404, { code: 'NOT_FOUND', message: `船舶 ${shipId} 不存在` });
      }

      await q(`UPDATE ships SET ${sets.join(', ')} WHERE id = ?`, [...args, shipId], conn);

      try {
        // await addLog?.(conn, {
        //   module: 'ships',
        //   action: 'update',
        //   remark: `shipId=${shipId}`,
        //   payload: JSON.stringify({ ship })
        // });
      } catch { }

      const [row] = await q(
        `SELECT id AS shipId, name AS shipName, type AS shipType
           FROM ships WHERE id = ?`,
        [shipId],
        conn
      );
      return row;
    });

    if (updated?.success === false) return;
    return ok(res, { data: { affected: 1, ship: updated } }, { message: msgMap[op] });
  }

  // DELETE
  if (!shipId) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'DELETE 需要提供 ship.shipId' });
  }

  const result = await withTransaction(async (conn) => {
    // 存在性检查
    const exists = await q('SELECT 1 FROM ships WHERE id = ?', [shipId], conn);
    if (!exists?.length) {
      return fail(res, 404, { code: 'NOT_FOUND', message: `船舶 ${shipId} 不存在` });
    }

    const ret = await q('DELETE FROM ships WHERE id = ?', [shipId], conn);

    try {
      // await addLog?.(conn, {
      //   module: 'ships',
      //   action: 'delete',
      //   remark: `shipId=${shipId}`,
      //   payload: JSON.stringify({ ship })
      // });
    } catch { }

    return { affected: ret?.affectedRows ?? 0 };
  });

  if (result?.success === false) return;
  return ok(res, { data: result }, { message: msgMap[op] });
}));

export default router;
