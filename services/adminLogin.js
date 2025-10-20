import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from '../utils.js';
import { genToken, TOKEN_TTL_SECONDS } from '../auth.js';
import bcrypt from 'bcryptjs';

const router = Router();

// 管理员登录（多端登录，最多 3 端）
router.post('/adminLogin', asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  const check = requireFields(req.body, ['username', 'password']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: '用户名和密码必填' });
  }

  // 仅允许 type=0 的管理用户
  const rows = await q(
    'SELECT username, password, type FROM users WHERE username = ? AND type = 0 LIMIT 1',
    [username]
  );
  if (rows.length === 0) {
    return fail(res, 404, { code: 'USER_NOT_FOUND', message: '账号不存在' });
  }

  const user = rows[0];
  const okPwd = await bcrypt.compare(String(password), String(user.password));
  if (!okPwd) {
    return fail(res, 400, { code: 'INVALID_PASSWORD', message: '密码错误' });
  }

  // 生成 token 与过期时间
  const token = genToken();
  const now = Date.now();
  const expiration = new Date(now + TOKEN_TTL_SECONDS * 1000);

  // 查该用户当前的 token 记录，按 last_login 升序（最早的在前）
  const tokenRows = await q(
    'SELECT token_id FROM tokens WHERE username = ? ORDER BY last_login ASC',
    [user.username]
  );

  if (tokenRows.length < 3) {
    // 未达到上限，新增一条
    await q(
      'INSERT INTO tokens (token, username, token_expiration, last_login) VALUES (?, ?, ?, ?)',
      [token, user.username, expiration, now]
    );
  } else {
    // 已达上限 = 3，替换“最早登录”的那条记录
    const oldestId = tokenRows[0].token_id;
    await q(
      'UPDATE tokens SET token = ?, token_expiration = ?, last_login = ? WHERE token_id = ?',
      [token, expiration, now, oldestId]
    );
  }

  addLog('AUTH_LOGIN', 'admin', '管理端Web', null, '登录管理端Web页面');

  return ok(
    res,
    { data: { token, user: { username: user.username, type: user.type } } },
    { message: '登录成功' }
  );
}));

export default router;