import { Router } from 'express';
import { ok, fail, asyncHandler, q, addLog, withTransaction, requireFields } from '../utils.js';

const router = Router();

// 撤销入库
router.post('/cancelInbound', asyncHandler(async (req, res) => {
  const { inboundId, remark } = req.body ?? {};

  const check = requireFields(req.body, ['inboundId']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'inboundId必填' });
  }

  try {
    const rows = await q(`SELECT 
      ship_id    AS shipId, 
      item_id    AS itemId, 
      status, 
      quantity,
      actual_quantity AS acqualQuantity
      FROM inbounds WHERE inbound_id = ? limit 1`, [inboundId]);
    if (rows.length === 0) {
      return fail(res, 422, { code: 'NOT_FOUND', message: '对应入库记录不存在' });
    }
    const inbound = rows[0];
    if (inbound.status !== 'CONFIRMED') {
      return fail(res, 409, { code: 'BAD_STATUS', message: '该入库记录不可被取消' });
    }

    const updInv = await q(
      'UPDATE inventory SET quantity = quantity - ? WHERE ship_id = ? AND item_id = ?',
      [inbound.acqualQuantity, inbound.shipId, inbound.itemId]
    );
    const updIbd = await q(
      `UPDATE inbounds 
      SET status = 'PENDING', canceled_at = NOW(), cancel_remark = ? 
      WHERE inbound_id = ?`,
      [remark, inboundId]
    );
    return ok(res, { data: true }, { message: '撤销入库成功' });
  } catch (err) {
    return fail(res, 500, { code: err?.code || 'DB_ERROR', message: err?.sqlMessage || '数据库错误' });
  }
}));

export default router;
