import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 获取物资日志记录
router.get('/getItemLogs', asyncHandler(async (req, res) => {
  const { itemId, shipId } = req.query || {};
  const check = requireFields(req.query, ['itemId', 'shipId']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing itemId or shipId' });
  }

  const rows1 = await q(`SELECT
      batch_no                                   AS batchNumber,
      quantity                                   AS quantity,
      CONVERT_TZ(created_at, '+00:00', '+08:00') AS createdAt
    FROM inbounds WHERE item_id = ? AND ship_id = ? 
    ORDER BY created_at DESC`, [itemId, shipId]);
  const rows2 = await q(`SELECT
      batch_no                                     AS batchNumber,
      quantity                                     AS quantity,
      actual_quantity                              AS actualQuantity,
      CONVERT_TZ(confirmed_at, '+00:00', '+08:00') AS confirmedAt,
      confirm_remark                               AS confirmRemark
    FROM inbounds WHERE item_id = ? AND ship_id = ? AND status = 'CONFIRMED' 
    ORDER BY confirmed_at DESC`, [itemId, shipId]);
  const rows3 = await q(`SELECT
      quantity                                     AS quantity,
      claimer                                      AS claimer,
      CONVERT_TZ(claimed_at, '+00:00', '+08:00')   AS claimedAt,
      claim_remark                                 AS claimRemark
    FROM claims WHERE item_id = ? AND ship_id = ? AND status = 'CLAIMED' 
    ORDER BY claimed_at DESC`, [itemId, shipId]);

  return ok(res, {
    data: {
      inbounds: rows1,
      confirms: rows2,
      claims: rows3
    }
  }, { message: '获取物资日志记录成功' });
}));

export default router;
