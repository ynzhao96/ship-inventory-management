import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 获取系统日志
router.post('/getSystemLog', asyncHandler(async (req, res) => {
  let { page = 1, pageSize = 10, startTime, endTime } = req.body ?? {};

  if ((startTime && !endTime) || (!startTime && endTime)) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: '时间信息无效' });
  }

  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
  const offset = (page - 1) * pageSize;

  // 预处理时间
  let startStr;
  let endStr;
  if (startTime && endTime) {
    startStr = toDayBoundary(startTime, 'start');
    endStr = toDayBoundary(endTime, 'end');
    if (!startStr || !endStr) {
      return fail(res, 400, { code: 'BAD_REQUEST', message: '时间格式无效' });
    }
  }

  const where = [];
  const params = [];
  if (startStr) {
    where.push(`time BETWEEN ? AND ?`);
    params.push([startStr, endStr]);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // 统计总数
  const countSql = `
      SELECT COUNT(1) AS total
        FROM logs
      ${whereSql}
    `;
  const [{ total }] = await q(countSql, params);

  const listSql = `
      SELECT
        id,
        event_type                           AS eventType,
        operator,
        object,
        quantity,
        CONVERT_TZ(time, '+00:00', '+08:00') AS time,
        note
        FROM logs
      ${whereSql}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;
  const rows = await q(listSql, [...params, pageSize, offset]);

  return ok(
    res,
    {
      data: {
        list: rows,
        page,
        pageSize,
        total: Number(total) || 0,
        totalPages: Math.ceil((Number(total) || 0) / pageSize),
      },
    },
    { message: '查询系统日志成功' },
  );
}));

export default router;
