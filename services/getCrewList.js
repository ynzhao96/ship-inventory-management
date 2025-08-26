import { Router } from 'express';
import { ok, fail, asyncHandler, q, addLog, withTransaction, requireFields } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 获取船员列表接口
router.get('/getCrewList', asyncHandler(async (req, res) => {
  const { shipId } = req.query || {};

  const check = requireFields(req.query, ['shipId']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing shipId' });
  }

  const rows = await q('SELECT * FROM crews WHERE ship_id = ?', [shipId]);
  return ok(res, { data: rows }, { message: '获取船员信息成功' });
}));

export default router;
