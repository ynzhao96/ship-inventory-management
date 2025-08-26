// auth.js
import crypto from 'crypto';
import { fail, q } from './utils.js';

export const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 天，可放到 .env
export function genToken() {
  return crypto.randomBytes(32).toString('hex'); // 64位hex，足够随机
}

/**
 * 读取请求头的 token：
 * - Authorization: Bearer <token>
 * - 或 X-Token: <token>
 */
function extractToken(req) {
  const authz = req.headers['authorization'];
  if (authz && typeof authz === 'string') {
    const [scheme, token] = authz.split(' ');
    if (/^Bearer$/i.test(scheme) && token) return token.trim();
  }
  const xt = req.headers['x-token'] || req.headers['x_auth_token'];
  if (typeof xt === 'string') return xt.trim();
  return null;
}

/**
 * 认证中间件：验证 token 是否存在、是否匹配 users.token、是否未过期
 * 失败时返回统一错误码：
 * - TOKEN_MISSING
 * - TOKEN_INVALID
 * - TOKEN_EXPIRED
 * 成功时在 req.user 注入用户信息
 */
export async function authRequired(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return fail(res, 401, { code: 'TOKEN_MISSING', message: '缺少认证信息' });
  }

  try {
    const rows = await q(
      `SELECT user_id AS userId, username, token_expiration AS tokenExpiration
         FROM users
        WHERE token = ?
        LIMIT 1`,
      [token]
    );

    if (rows.length === 0) {
      return fail(res, 401, { code: 'TOKEN_INVALID', message: '认证信息无效' });
    }

    const user = rows[0];
    const now = Date.now();
    const exp = new Date(user.tokenExpiration).getTime();
    if (!exp || exp <= now) {
      return fail(res, 401, { code: 'TOKEN_EXPIRED', message: '认证已过期' });
    }

    // 注入用户信息，后续接口可直接使用
    req.user = { userId: user.userId, username: user.username, token };
    return next();
  } catch (err) {
    return fail(res, 500, { code: err?.code || 'DB_ERROR', message: err?.sqlMessage || '数据库错误' });
  }
}
