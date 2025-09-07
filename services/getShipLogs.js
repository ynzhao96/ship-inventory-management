import { Router } from 'express';
import { ok, fail, asyncHandler, q, requireFields, toDayBoundary } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 允许的类型
const LOG_TYPES = new Set([
  'CLAIM',           // 领取创建
  'CANCEL_CLAIM',    // 领取取消
  'INBOUND_CREATE',  // 入库创建
  'INBOUND_CONFIRM', // 入库确认
  'INBOUND_CANCEL',  // 入库取消
  'ALL',
]);

router.post('/getShipLogs', asyncHandler(async (req, res) => {
  let { shipId, page = 1, pageSize = 10, startTime, endTime, logType = 'ALL' } = req.body ?? {};

  // 基本校验
  const check = requireFields(req.body, ['shipId']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'shipId必填' });
  }
  if (!LOG_TYPES.has(logType)) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: '无效的日志类型' });
  }
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

  // 构建每段子查询（尽量贴近你现有字段；若字段不同替换注释处）
  // —— claims: 创建（CLAIM） & 取消（CANCEL_CLAIM）
  const claimCreateSQL = `
    SELECT
      'CLAIM'                                        AS eventType,
      NULL                                           AS batchNumber,
      CONVERT_TZ(clm.claimed_at, '+00:00', '+08:00') AS eventTime,
      TRIM(clm.ship_id)                              AS shipId,
      clm.item_id                                    AS itemId,
      it.item_name                                   AS itemName,
      it.category_id                                 AS categoryId,
      clm.quantity                                   AS quantity,
      clm.claimer                                    AS actor,
      clm.claim_remark                               AS remark
    FROM claims AS clm
    LEFT JOIN items AS it ON it.item_id = clm.item_id
    WHERE TRIM(clm.ship_id) = ?
      ${startStr ? 'AND clm.claimed_at BETWEEN ? AND ?' : ''}
  `;

  const claimCancelSQL = `
    SELECT
      'CANCEL_CLAIM'                                  AS eventType,
      NULL                                            AS batchNumber,
      CONVERT_TZ(clm.canceled_at, '+00:00', '+08:00') AS eventTime,
      TRIM(clm.ship_id)                               AS shipId,
      clm.item_id                                     AS itemId,
      it.item_name                                    AS itemName,
      it.category_id                                  AS categoryId,
      clm.quantity                                    AS quantity,
      NULL                                            AS actor,
      clm.cancel_remark                               AS remark
    FROM claims AS clm
    LEFT JOIN items AS it ON it.item_id = clm.item_id
    WHERE TRIM(clm.ship_id) = ?
      AND clm.status = 'CANCELED'
      ${startStr ? 'AND clm.canceled_at BETWEEN ? AND ?' : ''}
  `;

  // —— inbounds: 创建（INBOUND_CREATE）/ 确认（INBOUND_CONFIRM）/ 取消（INBOUND_CANCEL）
  const inboundCreateSQL = `
    SELECT
      'INBOUND_CREATE'                               AS eventType,
      ibd.batch_no                                   AS batchNumber,
      CONVERT_TZ(ibd.created_at, '+00:00', '+08:00') AS eventTime,
      TRIM(ibd.ship_id)                              AS shipId,
      ibd.item_id                                    AS itemId,
      it.item_name                                   AS itemName,
      it.category_id                                 AS categoryId,
      ibd.quantity                                   AS quantity,
      'Administrator'                                AS actor,
      NULL                                           AS remark
    FROM inbounds AS ibd
    LEFT JOIN items AS it ON it.item_id = ibd.item_id
    WHERE TRIM(ibd.ship_id) = ?
      ${startStr ? 'AND ibd.created_at BETWEEN ? AND ?' : ''}
  `;

  const inboundConfirmSQL = `
    SELECT
      'INBOUND_CONFIRM'                                AS eventType,
      ibd.batch_no                                     AS batchNumber,
      CONVERT_TZ(ibd.confirmed_at, '+00:00', '+08:00') AS eventTime,
      TRIM(ibd.ship_id)                                AS shipId,
      ibd.item_id                                      AS itemId,
      it.item_name                                     AS itemName,
      it.category_id                                   AS categoryId,
      ibd.actual_quantity                              AS quantity,
      NULL                                             AS actor,
      ibd.confirm_remark                               AS remark
    FROM inbounds AS ibd
    LEFT JOIN items AS it ON it.item_id = ibd.item_id
    WHERE TRIM(ibd.ship_id) = ?
      AND ibd.confirmed_at IS NOT NULL
      ${startStr ? 'AND ibd.confirmed_at BETWEEN ? AND ?' : ''}
  `;

  const inboundCancelSQL = `
    SELECT
      'INBOUND_CANCEL'                                AS eventType,
      ibd.batch_no                                    AS batchNumber,
      CONVERT_TZ(ibd.canceled_at, '+00:00', '+08:00') AS eventTime,
      TRIM(ibd.ship_id)                               AS shipId,
      ibd.item_id                                     AS itemId,
      it.item_name                                    AS itemName,
      it.category_id                                  AS categoryId,
      ibd.actual_quantity                             AS quantity,
      NULL                                            AS actor,
      ibd.cancel_remark                               AS remark
    FROM inbounds AS ibd
    LEFT JOIN items AS it ON it.item_id = ibd.item_id
    WHERE TRIM(ibd.ship_id) = ?
      AND ibd.canceled_at IS NOT NULL
      ${startStr ? 'AND ibd.canceled_at BETWEEN ? AND ?' : ''}
  `;

  // 根据 logType 选择需要的子查询
  const parts = [];
  const params = [];

  const pushPart = (sql) => {
    parts.push(sql);
    params.push(shipId);
    if (startStr) params.push(startStr, endStr);
  };

  const need = (t) => logType === 'ALL' || logType === t;

  if (need('CLAIM')) pushPart(claimCreateSQL);
  if (need('CANCEL_CLAIM')) pushPart(claimCancelSQL);
  if (need('INBOUND_CREATE')) pushPart(inboundCreateSQL);
  if (need('INBOUND_CONFIRM')) pushPart(inboundConfirmSQL);
  if (need('INBOUND_CANCEL')) pushPart(inboundCancelSQL);

  if (parts.length === 0) {
    return ok(res, { data: { list: [], page, pageSize, total: 0, totalPages: 0 } }, { message: '查询船舶日志成功' });
  }

  // 统一的 UNION 体
  const unionSQL = parts.join('\nUNION ALL\n');

  // 统计总数
  const countSql = `
    SELECT COUNT(1) AS total
    FROM (
      ${unionSQL}
    ) AS t
  `;
  const [{ total }] = await q(countSql, params);

  // 列表查询（按时间倒序）
  const listSql = `
    SELECT *
    FROM (
      ${unionSQL}
    ) AS t
    ORDER BY t.eventTime DESC
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
    { message: '查询船舶日志成功' },
  );
}));

export default router;
