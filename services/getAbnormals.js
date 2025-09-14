import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 获取异常信息
router.get('/getAbnormals', asyncHandler(async (req, res) => {
  try {
    const rows = await q(`SELECT
      inv.ship_id     AS shipId, 
      shp.name        AS shipName,
      inv.item_id     AS itemId,
      it.item_name    AS itemName,
      it.item_name_en AS itemNameEn,
      inv.quantity    AS quantity,
      inv.threshold   AS threshold,
      it.category_id  AS categoryId,
      it.unit         AS unit
      FROM inventory  AS inv
      JOIN items AS it
      ON it.item_id = inv.item_id
      JOIN ships AS shp
      ON inv.ship_id = shp.id
      WHERE inv.threshold IS NOT NULL AND inv.quantity < inv.threshold
    `);
    return ok(res, { data: rows }, { message: '获取异常信息成功' });
  } catch (err) {
    return fail(res, 500, { code: err?.code || 'DB_ERROR', message: err?.sqlMessage || '数据库错误' });
  }
}));

export default router;
