import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 获取待入库信息
router.get('/getInboundList', asyncHandler(async (req, res) => {
  const { shipId } = req.query || {};
  const rows = await q(`SELECT 
    inbound_id AS inboundId,
    batch_no AS batchNumber,
    item_id AS itemId,
    quantity,
    status,
    created_at AS createdAt
    FROM inbounds 
    WHERE ship_id = ? and status = 'PENDING'`,
    [shipId]
  );
  return ok(res, {
    totalInbounds: rows.length,
    data: rows,
  }, { message: '获取待入库信息成功' });
}));

export default router;
