import pool from './db.js';

export const ok = (res, payload = {}, { code = 'OK', message } = {}) => {
  return res.status(200).json({
    success: true,
    code,
    message,
    ...payload,        // 可放 { data: rows } 或 { user: {...} } 等
  });
};

// 为了兼容你现有前端，有的接口用了 error，有的只用 message。
// 这里两个字段都带上，避免改动现有前端。
export const fail = (res, httpStatus, { code = 'ERROR', message = 'Error', extra = {} } = {}) => {
  return res.status(httpStatus).json({
    success: false,
    code,
    message,
    error: message,     // 兼容字段
    ...extra,           // 可放更多信息
  });
};

// 异步路由包装器：集中 try/catch 与 500 处理
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error('Unhandled error:', err);
    return fail(res, 500, { code: 'INTERNAL_ERROR', message: 'Internal server error' });
  });

// 必填项校验
export const requireFields = (obj, fields) => {
  const missing = fields.filter((f) => !obj || obj[f] == null || obj[f] === '');
  return { ok: missing.length === 0, missing };
};

// DB 查询小封装：返回 rows，出现异常交给 asyncHandler
export const q = async (sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};

// 新增日志
export const addLog = async (eventType, operator, object, quantity, note) => {
  const insert = await q('INSERT INTO logs (event_type, operator, object, quantity, note, time) VALUES (?, ?, ?, ?, ?, NOW())', [eventType, note, operator, object, quantity]);
  return { ok: true }
}