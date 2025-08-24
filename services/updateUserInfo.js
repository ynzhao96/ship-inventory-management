import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from '../utils.js';

const router = Router();

// 更新用户账号密码信息
router.post('/updateUserInfo', asyncHandler(async (req, res) => {
  const { shipId, username, password } = req.body || {};
  if (!shipId) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'shipId必填' });
  }

  try {
    const rows = await q(
      'SELECT username, ship_id, type FROM users WHERE ship_id = ? AND type = 1 LIMIT 1',
      [shipId]
    );
    const newUser = rows.length === 0;

    if (newUser) {
      // 新增分支：username/password 必填
      if (!username || !password) {
        return fail(res, 400, { code: 'BAD_REQUEST', message: '新增需要提供 username 和 password' });
      }
      const ins = await q(
        'INSERT INTO users (ship_id, username, password, type) VALUES (?, ?, ?, 1)',
        [shipId, username, password]
      );
      // ins.insertId 可用（若你需要）
    } else {
      // 更新分支：至少需要一个字段
      if ((username == null || username === '') && (password == null || password === '')) {
        return fail(res, 400, { code: 'BAD_REQUEST', message: '请至少提供 username 或 password 之一' });
      }
      const sets = [];
      const params = [];
      if (username != null && username !== '') { sets.push('username = ?'); params.push(username); }
      if (password != null && password !== '') { sets.push('password = ?'); params.push(password); }
      params.push(shipId);

      const upd = await q(
        `UPDATE users SET ${sets.join(', ')} WHERE ship_id = ? AND type = 1 LIMIT 1`,
        params
      );
      // upd.affectedRows 可用（若你需要）
    }

    const [ret] = await q(
      'SELECT ship_id, username, type FROM users WHERE ship_id = ? AND type = 1 LIMIT 1',
      [shipId]
    );
    return ok(res, { data: ret }, { message: newUser ? '创建用户成功' : '更新用户成功' });

  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return fail(res, 409, { code: 'DUPLICATE', message: '用户名已存在' });
    }
    console.error('updateUserInfo error:', err);
    return fail(res, 500, { code: 'DB_ERROR', message: '数据库错误' });
  }
}));

export default router;
