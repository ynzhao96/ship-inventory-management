import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from '../utils.js';

const router = Router();

// 登录接口
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  const check = requireFields(req.body, ['username', 'password']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: '用户名和密码必填' });
  }

  const rows = await q(
    'SELECT username, password, ship_id, type FROM users WHERE username = ? and type = 1 LIMIT 1',
    [username]
  );

  if (rows.length === 0) {
    return fail(res, 422, { code: 'USER_NOT_FOUND', message: '账号不存在' });
  }

  const user = rows[0];
  // ⚠️ 生产请改为 bcrypt.compare
  if (user.password !== password) {
    return fail(res, 401, { code: 'INVALID_PASSWORD', message: '密码错误' });
  }

  addLog('AUTH_LOGIN', user.type, user.ship_id, null, '登录app端页面');
  return ok(res, {
    data: { shipId: user.ship_id, type: user.type },
    // 生产建议返回 JWT：token: 'xxx'
  }, { message: '登录成功' });
}));

export default router;
