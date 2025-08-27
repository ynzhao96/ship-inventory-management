import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 获取待入库信息
router.get('/getInboundList', asyncHandler(async (req, res) => {
  const { shipId } = req.query || {};
  const rows = await q(`SELECT 
      ibd.inbound_id  AS inboundId,
      ibd.batch_no    AS batchNumber,
      ibd.item_id     AS itemId,
      it.item_name    AS itemName,
      it.unit         AS unit,
      ibd.quantity    AS quantity,
      ibd.status      AS status,
      ibd.created_at  AS createdAt
    FROM inbounds AS ibd
    LEFT JOIN items AS it ON it.item_id = ibd.item_id 
    WHERE ibd.ship_id = ? and ibd.status = 'PENDING'`,
    [shipId]
  );
  return ok(res, {
    totalInbounds: rows.length,
    data: rows,
  }, { message: '获取待入库信息成功' });
}));

export default router;
