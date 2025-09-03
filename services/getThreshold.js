import { Router } from 'express';
import { ok, fail, asyncHandler, q, addLog, withTransaction } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 获取预警配置
router.get('/getThreshold', asyncHandler(async (req, res) => {
  const rawShipId = req.query?.shipId;
  const shipId = String(rawShipId ?? '').trim();

  if (!shipId) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing shipId' });
  }

  try {
    const rows = await q(`SELECT 
      inv.item_id     AS itemId,
      it.item_name    AS itemName,
      it.item_name_en AS itemNameEN,
      inv.quantity    AS quantity,
      inv.threshold   AS threshold,
      it.unit         AS unit
      FROM inventory  AS inv
      JOIN items AS it
      ON it.item_id = inv.item_id
      WHERE TRIM(inv.ship_id) = TRIM(?) AND threshold IS NOT NULL`,
      [shipId]);
    return ok(res, { data: rows }, { message: '获取预警值成功' });
  } catch (err) {
    return fail(res, 500, { code: err?.code || 'DB_ERROR', message: err?.sqlMessage || '数据库错误' });
  }
}));

export default router;
