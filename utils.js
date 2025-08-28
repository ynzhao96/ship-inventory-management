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

// 1) 单条查询：可选传入 conn（事务场景）
// 注意：对于 INSERT/UPDATE，mysql2 的第1个返回值是 ResultSetHeader（含 insertId/affectedRows）
export const q = async (sql, params = [], conn = null) => {
  const runner = conn ?? pool;
  const [result] = await runner.query(sql, params);
  return result; // SELECT = RowDataPacket[]；INSERT/UPDATE = ResultSetHeader
};

// 2) 事务辅助：自动 getConnection + begin/commit/rollback + release
export const withTransaction = async (fn) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const ret = await fn(conn);
    await conn.commit();
    return ret;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

// 新增日志
export const addLog = async (eventType, operator, object, quantity, note) => {
  const insert = await q('INSERT INTO logs (event_type, operator, object, quantity, note, time) VALUES (?, ?, ?, ?, ?, NOW())', [eventType, operator, object, quantity, note]);
  return { ok: true }
}

// 处理时间段
export function toDayBoundary(val, which /* 'start' | 'end' */) {
  const s = String(val ?? '').trim();
  // 支持 YYYY-MM-DD / YYYY/MM/DD，允许后面带时间
  const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (!m) return null; // 兜底：入参不是日期，返回 null 让调用处决定如何处理
  const [_, y, mo, d] = m;
  const mm = mo.padStart(2, '0');
  const dd = d.padStart(2, '0');
  return which === 'start'
    ? `${y}-${mm}-${dd} 00:00:00`
    : `${y}-${mm}-${dd} 23:59:59`;
}