import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 获取船舶信息
router.get('/getItemInfo', asyncHandler(async (req, res) => {
  const { itemId } = req.query || {};
  const check = requireFields(req.query, ['itemId']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing itemId' });
  }

  const rows = await q(`SELECT 
      item_id       AS itemId,
      item_name     AS itemName,
      item_name_en  AS itemNameEn,
      unit          AS unit,
      specification AS specification,
      category_id   AS categoryId
    FROM items WHERE item_id = ?`, [itemId]);
  if (rows.length === 0) {
    return fail(res, 422, { code: 'NOT_FOUND', message: 'Item not found' });
  }

  return ok(res, { data: rows[0] }, { message: '获取物资信息成功' });
}));

export default router;
