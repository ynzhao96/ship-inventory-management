import { Router } from 'express';
import { ok, fail, asyncHandler, q, requireFields } from '../utils.js';
import { genToken, TOKEN_TTL_SECONDS } from '../auth.js'; // 第2步里的工具

const router = Router();

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

  // TODO: 使用 bcrypt.compare(password, user.passwordHash) 等安全方式
  if (password !== user.password) {
    return fail(res, 400, { code: 'LOGIN_FAILED', message: '密码错误' });
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

  // 4) 返回 token 与过期时间（ISO 字符串方便前端处理）
  return ok(res, { data: { token, shipId: user.shipId } }, { message: '登录成功' });
}));

export default router;
