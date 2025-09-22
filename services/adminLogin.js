import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from '../utils.js';
import { genToken, TOKEN_TTL_SECONDS } from '../auth.js';
import bcrypt from 'bcryptjs';

const router = Router();

// 管理员登录
router.post('/adminLogin', asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  const check = requireFields(req.body, ['username', 'password']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: '用户名和密码必填' });
  }

  const rows = await q(
    'SELECT username, password, type FROM users WHERE username = ? and type = 0 LIMIT 1',
    [username]
  );
  if (rows.length === 0) {
    return fail(res, 404, { code: 'USER_NOT_FOUND', message: '账号不存在' });
  }

  const user = rows[0];

  const input = String(password);
  let okPwd = false;
  okPwd = await bcrypt.compare(input, String(user.password));
  if (!okPwd) {
    return fail(res, 400, { code: 'INVALID_PASSWORD', message: '密码错误' });
  }

  // 2) 生成 token 与过期时间
  const token = genToken();
  const expiration = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000);

  // 3) 更新到 users 表（一个帐号仅保留一个有效 token）
  await q(
    `UPDATE users
        SET token = ?, token_expiration = ?
      WHERE username = ?`,
    [token, expiration, user.username]
  );

  addLog('AUTH_LOGIN', 'admin', '管理端Web', null, '登录管理端Web页面');
  return ok(res, { data: { token, user: { username: user.username, type: user.type } } }, { message: '登录成功' });
}));

export default router;
