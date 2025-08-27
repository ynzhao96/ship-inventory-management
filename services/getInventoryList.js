import { Router } from 'express';
import { ok, fail, asyncHandler, q, addLog, withTransaction } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 获取全部库存接口（支持 keyword 与 categoryId 过滤）
router.post('/getInventoryList', asyncHandler(async (req, res) => {
  const rawShipId = req.body?.shipId;
  const searchMatch = req.body?.searchMatch;
  const categoryIdInput = req.body?.categoryId;

  const shipId = normalizeId(rawShipId);
  if (!shipId) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing shipId' });
  }

  const where = ['TRIM(inv.ship_id) = ?'];
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

  const sql = `
    SELECT
      inv.ship_id              AS shipId,
      inv.item_id              AS itemId,
      inv.quantity             AS quantity,
      inv.remark               AS remark,
      it.item_name             AS itemName,
      it.item_name_en          AS itemNameEn,
      it.category_id           AS categoryId,
      it.unit                  AS unit,
      it.specification         AS specification
    FROM inventory AS inv
    JOIN items AS it
      ON it.item_id = inv.item_id
    WHERE ${where.join(' AND ')}
    ORDER BY it.item_name ASC, it.item_id ASC
  `;

  try {
    const rows = await q(sql, params);
    return ok(res, { data: rows }, { message: 'Inventory fetched successfully' });
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

// 统一把 categoryId 规格化为字符串数组：[], ['10'], ['10','12']
function normalizeCategoryIds(input) {
  if (input == null) return [];
  // 如果是对象里套值
  if (typeof input === 'object' && !Array.isArray(input)) {
    input = input.categoryId ?? input.id ?? input.value ?? input.key ?? '';
  }
  if (Array.isArray(input)) {
    return input
      .map(v => String(v ?? '').trim())
      .filter(Boolean);
  }
  // 字符串或数字
  const s = String(input ?? '').trim();
  if (!s) return [];
  // 逗号分隔
  if (s.includes(',')) {
    return s.split(',').map(x => x.trim()).filter(Boolean);
  }
  return [s];
}

export default router;
