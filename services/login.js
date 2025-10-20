import { Router } from 'express';
import { ok, fail, asyncHandler, q, requireFields } from '../utils.js';
import { genToken, TOKEN_TTL_SECONDS } from '../auth.js';
import bcrypt from 'bcryptjs';

const router = Router();

// 船舶端登录(多端登录，最多 3 端)
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body ?? {};
  const check = requireFields(req.body, ['username', 'password']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'username与password必填' });
  }

  // 1) 查用户与密码（示例用明文对比，实际应是 hash 对比）
  const rows = await q(
    `SELECT username, password, ship_id AS shipId
       FROM users
      WHERE username = ? AND type = 1
      LIMIT 1`,
    [username]
  );
  if (rows.length === 0) {
    return fail(res, 400, { code: 'LOGIN_FAILED', message: '用户名不存在' });
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

  // 查该用户当前的 token 记录，按 last_login 升序（最早的在前）
  const tokenRows = await q(
    'SELECT token_id FROM tokens WHERE username = ? ORDER BY last_login ASC',
    [user.username]
  );

  if (tokenRows.length < 3) {
    // 未达到上限，新增一条
    await q(
      'INSERT INTO tokens (token, username, token_expiration, last_login) VALUES (?, ?, ?, NOW())',
      [token, user.username, expiration]
    );
  } else {
    // 已达上限 = 3，替换“最早登录”的那条记录
    const oldestId = tokenRows[0].token_id;
    await q(
      'UPDATE tokens SET token = ?, token_expiration = ?, last_login = NOW() WHERE token_id = ?',
      [token, expiration, oldestId]
    );
  }

  // 4) 返回 token 与过期时间（ISO 字符串方便前端处理）
  return ok(res, { data: { token, shipId: user.shipId } }, { message: '登录成功' });
}));

export default router;
