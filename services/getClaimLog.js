import { Router } from 'express';
import { ok, fail, asyncHandler, q, addLog, withTransaction, requireFields, toDayBoundary } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 查询申领历史
router.post('/getClaimLog', asyncHandler(async (req, res) => {
  let { shipId, searchMatch, page = 1, pageSize = 10, startTime, endTime } = req.body ?? {};

  // 必填校验
  const check = requireFields(req.body, ['shipId']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'shipId必填' });
  }

  // 时间参数成对出现
  if ((startTime && !endTime) || (!startTime && endTime)) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: '时间信息无效' });
  }

  // 分页参数兜底/限流
  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
  const offset = (page - 1) * pageSize;

  try {
    // 动态 where 与参数
    const where = [`TRIM(clm.ship_id) = ? AND status = 'CLAIMED'`];
    const params = [shipId];

    // 关键字模糊匹配（itemId / itemName）
    const kw = typeof searchMatch === 'string' ? searchMatch.trim() : '';
    if (kw) {
      where.push(`(
        clm.item_id LIKE ?
        OR it.item_name LIKE ?
      )`);
      const like = `%${kw}%`;
      params.push(like, like);
    }

    // 时间区间（含端点）
    if (startTime && endTime) {
      const startStr = toDayBoundary(startTime, 'start');
      const endStr = toDayBoundary(endTime, 'end');
      if (!startStr || !endStr) {
        return fail(res, 400, { code: 'BAD_REQUEST', message: '时间格式无效' });
      }
      where.push(`clm.claimed_at BETWEEN ? AND ?`);
      params.push(startStr, endStr);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // 统计总数
    const countSql = `
      SELECT COUNT(1) AS total
        FROM claims AS clm
        LEFT JOIN items AS it ON it.item_id = clm.item_id
      ${whereSql}
    `;
    const [{ total }] = await q(countSql, params);

    // 数据列表
    const listSql = `
      SELECT
        clm.claim_id                                   AS claimId,
        clm.item_id                                    AS itemId,
        it.item_name                                   AS itemName,
        it.item_name_en                                AS itemNameEn,
        it.category_id                                 AS categoryId,
        it.unit                                        AS unit,
        it.specification                               AS specification,
        clm.quantity                                   AS quantity,
        clm.claimer                                    AS claimer,
        CONVERT_TZ(clm.claimed_at, '+00:00', '+08:00') AS claimedAt,
        clm.claim_remark                               AS claimRemark
      FROM claims AS clm
      LEFT JOIN items AS it ON it.item_id = clm.item_id
      ${whereSql}
      ORDER BY clm.claimed_at DESC, clm.claim_id DESC
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
      { message: '查询申领历史成功' },
    );

  } catch (err) {
    return fail(res, 500, { code: err?.code || 'DB_ERROR', message: err?.sqlMessage || '数据库错误' });
  }
}));

export default router;
