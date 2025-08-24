import { Router } from 'express';
import { ok, fail, asyncHandler, q, addLog, withTransaction, requireFields } from '../utils.js';

const router = Router();

// 申领物资接口
router.post('/claimItem', asyncHandler(async (req, res) => {
  const { shipId, itemId, quantity, remark, claimer } = req.body;
  const check = requireFields(req.body, ['shipId', 'itemId', 'quantity', 'claimer']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'shipId, itemId, quantity, claimer必填' });
  }
  const row = await q('SELECT quantity FROM inventory WHERE ship_id = ? AND item_id = ?', [shipId, itemId]);
  if (row.length === 0) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: '对应物资不存在' });
  }
  if (quantity > row[0].quantity) {
    return fail(res, 400, { code: 'BAD_QTY', message: 'quantity必须小于等于库存数量' });
  }

  try {
    const upd = await q('UPDATE inventory SET quantity = ? WHERE ship_id = ? AND item_id = ?', [row[0].quantity - quantity, shipId, itemId]);
    addLog('CLAIM', `${shipId} - ${claimer}`, itemId, quantity, remark);

    return ok(res, { data: true }, { message: '申领物资成功' });
  } catch (err) {
    return fail(res, 500, { code: err?.code || 'DB_ERROR', message: err?.sqlMessage || '数据库错误' });
  }
}));

export default router;
