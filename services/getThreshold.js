import { Router } from 'express';
import { ok, fail, asyncHandler, q, addLog, withTransaction } from '../utils.js';

const router = Router();

// 获取全部库存接口
router.get('/getThreshold', asyncHandler(async (req, res) => {
  const { shipId } = req.query || {};

  if (!shipId) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing shipId' });
  }

  try {
    const rows = await q(`SELECT 
      inv.item_id    AS itemId,
      it.item_name   AS itemName,
      threshold
      FROM inventory AS inv
      JOIN items AS it
      ON it.item_id = inv.item_id
      WHERE ship_id = ? AND !!threshold`,
      [shipId]);
    return ok(res, { data: rows }, { message: '获取预警值成功' });
  } catch (err) {
    return fail(res, 500, { code: err?.code || 'DB_ERROR', message: err?.sqlMessage || '数据库错误' });
  }
}));

export default router;
