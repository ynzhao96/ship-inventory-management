// services/confirmInbound.js
import { Router } from 'express';
import { ok, fail, asyncHandler, q, addLog, withTransaction } from '../utils.js';

const router = Router();

// 获取全部库存接口
router.post('/getInventoryList', asyncHandler(async (req, res) => {
  const rawShipId = req.body?.shipId;
  const keyword = req.body?.keyword;
  function normalizeId(input) {
    if (input && typeof input === 'object') {
      const v = input.shipId ?? input.id ?? input.value ?? input.key;
      return v != null ? String(v).trim() : '';
    }
    return String(input ?? '').trim();
  }

  const shipId = normalizeId(rawShipId);
  if (!shipId) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing shipId' });
  }

  const where = ['TRIM(inv.ship_id) = ?']; // 双保险：列也 TRIM 一次
  const params = [shipId];

  if (keyword && String(keyword).trim() !== '') {
    const kw = `%${String(keyword).trim()}%`;
    where.push('(it.item_id LIKE ? OR it.item_name LIKE ? OR it.item_name_en LIKE ?)');
    params.push(kw, kw, kw);
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

export default router;
