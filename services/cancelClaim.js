import { Router } from 'express';
import { ok, fail, asyncHandler, q, addLog, withTransaction, requireFields } from '../utils.js';

const router = Router();

// 撤销申领物资
router.post('/cancelClaim', asyncHandler(async (req, res) => {
  const { claimId, remark } = req.body ?? {};

  const check = requireFields(req.body, ['claimId']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'claimId必填' });
  }

  try {
    const rows = await q(`SELECT 
      ship_id    AS shipId, 
      item_id    AS itemId, 
      status, 
      quantity 
      FROM claims WHERE claim_id = ? limit 1`, [claimId]);
    if (rows.length === 0) {
      return fail(res, 422, { code: 'NOT_FOUND', message: '对应申领记录不存在' });
    }
    const claim = rows[0];
    if (claim.status !== 'CLAIMED') {
      return fail(res, 409, { code: 'BAD_STATUS', message: '该申领记录已被取消' });
    }

    const updInv = await q(
      'UPDATE inventory SET quantity = quantity + ? WHERE ship_id = ? AND item_id = ?',
      [claim.quantity, claim.shipId, claim.itemId]
    );
    const updClm = await q(
      `UPDATE claims 
      SET status = 'CANCELED', canceled_at = NOW(), cancel_remark = ? 
      WHERE claim_id = ?`,
      [remark, claimId]
    );
    return ok(res, { data: true }, { message: '撤销申领成功' });
  } catch (err) {
    return fail(res, 500, { code: err?.code || 'DB_ERROR', message: err?.sqlMessage || '数据库错误' });
  }
}));

export default router;
