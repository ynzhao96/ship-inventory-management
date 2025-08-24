import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from '../utils.js';

const router = Router();

// 获取用户账户密码信息
router.get('/getUserInfo', asyncHandler(async (req, res) => {
  const { shipId } = req.query || {};

  const check = requireFields(req.query, ['shipId']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing shipId' });
  }

  const rows = await q('SELECT * FROM users WHERE ship_id = ?', [shipId]);
  return ok(res, { data: rows?.[0] || {} }, { message: 'User info fetched successfully' });
}));

export default router;


