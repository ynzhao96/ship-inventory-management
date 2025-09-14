import { Router } from 'express';
import { ok, fail, asyncHandler, q, addLog, withTransaction, normalizeCategoryIds } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 获取全部库存接口（支持 keyword 与 categoryId 过滤）
router.post('/getInventoryList', asyncHandler(async (req, res) => {
  const rawShipId = req.body?.shipId;
  const searchMatch = req.body?.searchMatch;
  const categoryIdInput = req.body?.categoryId;
  let page = req.body?.page ?? 1;
  let pageSize = req.body?.pageSize ?? 10;

  const shipId = normalizeId(rawShipId);
  if (!shipId) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing shipId' });
  }

  const where = ['TRIM(inv.ship_id) = ?', 'inv.quantity > 0'];
  const params = [shipId];

  // 关键词模糊匹配
  const keyword = typeof searchMatch === 'string' ? searchMatch.trim() : '';
  if (keyword && String(keyword).trim() !== '') {
    const kw = `%${String(keyword).trim()}%`;
    where.push('(it.item_id LIKE ? OR it.item_name LIKE ? OR it.item_name_en LIKE ?)');
    params.push(kw, kw, kw);
  }

  // 类别过滤（支持单个/多个）
  const categoryIds = normalizeCategoryIds(categoryIdInput);
  if (categoryIds.length === 1) {
    where.push('it.category_id = ?');
    params.push(categoryIds[0]);
  } else if (categoryIds.length > 1) {
    where.push(`it.category_id IN (${categoryIds.map(() => '?').join(',')})`);
    params.push(...categoryIds);
  }

  // 分页参数兜底/限流
  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
  const offset = (page - 1) * pageSize;

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // 统计总数
  const countSql = `
      SELECT COUNT(1) AS total
        FROM inventory AS inv
        LEFT JOIN items AS it ON it.item_id = inv.item_id
      ${whereSql}
    `;
  const [{ total }] = await q(countSql, params);

  const sql = `
    SELECT
      inv.ship_id                AS shipId,
      inv.item_id                AS itemId,
      inv.quantity               AS quantity,
      inv.threshold              AS threshold,
      inv.remark                 AS remark,
      it.item_name               AS itemName,
      it.item_name_en            AS itemNameEn,
      it.category_id             AS categoryId,
      it.unit                    AS unit,
      it.specification           AS specification,
      COALESCE(p.pendingQuantity, 0) AS inboundQuantity
    FROM inventory AS inv
    JOIN items AS it
      ON it.item_id = inv.item_id
    LEFT JOIN (
      SELECT 
        item_id, 
        SUM(quantity) AS pendingQuantity
      FROM inbounds
      WHERE ship_id = ? AND status = 'PENDING'
      GROUP BY item_id
    ) p ON p.item_id = it.item_id 
    ${whereSql}
    ORDER BY it.item_id ASC
    LIMIT ? OFFSET ?
  `;

  try {
    const rows = await q(sql, [shipId, ...params, pageSize, offset]);
    return ok(res, {
      data: {
        list: rows,
        page,
        pageSize,
        total: Number(total) || 0,
        totalPages: Math.ceil((Number(total) || 0) / pageSize),
      },
    }, { message: 'Inventory fetched successfully' });
  } catch (err) {
    console.error('getInventoryList error:', {
      code: err?.code, errno: err?.errno, message: err?.sqlMessage || err?.message, sql: err?.sql,
    });
    return fail(res, 500, { code: err?.code || 'DB_ERROR', message: err?.sqlMessage || '数据库错误' });
  }
}));

function normalizeId(input) {
  if (input && typeof input === 'object') {
    const v = input.shipId ?? input.id ?? input.value ?? input.key;
    return v != null ? String(v).trim() : '';
  }
  return String(input ?? '').trim();
}

export default router;
