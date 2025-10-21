import { Router } from 'express';
import { ok, fail, asyncHandler, q, addLog, withTransaction, requireFields } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

/**
 * Body 约定：
 * {
 *   operation: 'UPDATE' | 'DELETE',
 *   inbound: {
 *     batchNumber?: string;
 *     createdAt?: string;
 *     inboundId?: number;
 *     itemId?: string;
 *     itemName?: string;
 *     itemNameEn?: string;
 *     quantity?: number;
 *     status?: string;
 *     unit?: string;
 *   },
 * }
 */

// 编辑待入库信息
router.post('/updateInbound', asyncHandler(async (req, res) => {
  const { inbound = {}, operation } = req.body ?? {};
  const op = operation;

  if (!['UPDATE', 'DELETE'].includes(op)) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'operation 必须是 UPDATE / DELETE' });
  }

  // 统一取值 & 清洗
  const toStr = (v) => (v === undefined || v === null ? '' : String(v).trim());
  const inboundId = toStr(inbound.inboundId);
  const batchNumber = toStr(inbound.batchNumber);
  const quantity = inbound.quantity;

  // 文案
  const msgMap = {
    UPDATE: '更新入库信息成功',
    DELETE: '删除入库信息成功',
  };

  if (op === 'UPDATE') {
    if (!inboundId || !batchNumber || !quantity) {
      return fail(res, 400, { code: 'BAD_REQUEST', message: 'UPDATE 需要提供 inboundId、batchNumber、quantity' });
    }

    // 动态拼接要更新的字段（只更新传入的字段）
    const sets = [];
    const args = [];
    // if (inboundId !== undefined) { sets.push('inbound_id = ?'); args.push(inboundId); }
    if (batchNumber !== undefined) { sets.push('batch_no = ?'); args.push(batchNumber); }
    if (quantity !== undefined) { sets.push('quantity = ?'); args.push(quantity); }

    if (sets.length === 0) {
      return fail(res, 400, { code: 'NO_CHANGES', message: '未提供需要更新的字段' });
    }

    sets.push('created_at = NOW()');

    const updated = await withTransaction(async (conn) => {
      const exists = await q('SELECT 1 FROM inbounds WHERE inbound_id = ?', [inboundId], conn);
      if (!exists?.length) {
        return fail(res, 404, { code: 'NOT_FOUND', message: `入库信息 ${inboundId} 不存在` });
      }

      await q(`UPDATE inbounds SET ${sets.join(', ')} WHERE inbound_id = ?`, [...args, inboundId], conn);

      try {
        // await addLog?.(conn, {
        //   module: 'inbounds',
        //   action: 'update',
        //   remark: `inboundId=${inboundId}`,
        //   payload: JSON.stringify({ inbound })
        // });
      } catch { }

      const [row] = await q(
        `SELECT inbound_id AS inboundId, item_id AS itemId, batch_no AS batchNumber
             FROM inbounds WHERE inbound_id = ?`,
        [inboundId],
        conn
      );
      return row;
    });

    if (updated?.success === false) return;
    return ok(res, { data: { affected: 1, inbound: updated } }, { message: msgMap[op] });
  }

  // DELETE
  if (!inboundId) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'DELETE 需要提供 inbound.inboundId' });
  }

  const result = await withTransaction(async (conn) => {
    // 存在性检查
    const exists = await q('SELECT 1 FROM inbounds WHERE inbound_id = ?', [inboundId], conn);
    if (!exists?.length) {
      return fail(res, 404, { code: 'NOT_FOUND', message: `入库信息 ${inboundId} 不存在` });
    }

    const ret = await q('DELETE FROM inbounds WHERE inbound_id = ?', [inboundId], conn);

    try {
      // await addLog?.(conn, {
      //   module: 'inbounds',
      //   action: 'delete',
      //   remark: `inboundId=${inboundId}`,
      //   payload: JSON.stringify({ inbound })
      // });
    } catch { }

    return { affected: ret?.affectedRows ?? 0 };
  });

  if (result?.success === false) return;
  return ok(res, { data: result }, { message: msgMap[op] });
}));

export default router;
