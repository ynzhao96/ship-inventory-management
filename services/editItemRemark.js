import { Router } from 'express';
import { ok, fail, asyncHandler, q, addLog, withTransaction, requireFields } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 编辑库存备注
router.post('/editItemRemark', asyncHandler(async (req, res) => {
  const { shipId, itemId, remark } = req.body || {};

  const check = requireFields(req.body, ['shipId', 'itemId']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing shipId or itemId' });
  }

  const rows = await q('SELECT * FROM inventory WHERE ship_id = ? AND item_id = ?', [shipId, itemId]);
  if (rows.length === 0) {
    return fail(res, 422, { code: 'BAD_ITEMS', message: '未找到对应的记录' });
  }
  const upd = await q('UPDATE inventory SET remark = ? WHERE ship_id = ? AND item_id = ?', [remark, shipId, itemId]);
  return ok(res, { data: true }, { message: '修改备注成功' });
}));

export default router;
