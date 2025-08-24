import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from '../utils.js';

const router = Router();

// 获取船舶信息
router.get('/getShipInfo', asyncHandler(async (req, res) => {
  const { id } = req.query || {};
  const check = requireFields(req.query, ['id']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing id' });
  }

  const rows = await q('SELECT * FROM ships WHERE id = ?', [id]);
  if (rows.length === 0) {
    return fail(res, 404, { code: 'NOT_FOUND', message: 'Ship not found' });
  }

  return ok(res, { data: rows[0] }, { message: '获取船舶信息成功' });
}));

export default router;
