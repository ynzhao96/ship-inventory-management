import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from '../utils.js';

const router = Router();

// 获取船舶列表
router.get('/getShipList', asyncHandler(async (_req, res) => {
  const rows = await q('SELECT * FROM ships');
  return ok(res, {
    totalShips: rows.length,
    data: rows,
  }, { message: '获取船舶列表成功' });
}));

export default router;
