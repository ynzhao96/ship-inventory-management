import { Router } from 'express';
import { ok, fail, asyncHandler, q, addLog, withTransaction, requireFields } from '../utils.js';

const router = Router();

// 申领物资接口
router.post('/claimItem', asyncHandler(async (req, res) => {
  const { shipId, itemId, quantity, remark, claimer } = req.body ?? {};
  const check = requireFields(req.body, ['shipId', 'itemId', 'quantity', 'claimer']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'shipId, itemId, quantity, claimer必填' });
  }

  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) {
    return fail(res, 400, { code: 'BAD_QTY', message: 'quantity 必须为正数' });
  }

  // 原子更新：仅当库存 >= qty 时扣减成功
  const upd = await q(
    'UPDATE inventory SET quantity = quantity - ? WHERE ship_id = ? AND item_id = ? AND quantity >= ?',
    [qty, shipId, itemId, qty]
  );

  if (upd.affectedRows === 0) {
    // 进一步区分：不存在 vs 库存不足
    const row = await q('SELECT quantity FROM inventory WHERE ship_id = ? AND item_id = ?', [shipId, itemId]);
    if (row.length === 0) {
      return fail(res, 422, { code: 'NOT_FOUND', message: '对应物资不存在' });
    }
    return fail(res, 409, { code: 'BAD_QTY', message: `库存不足，当前库存=${row[0].quantity}` });
  }

  // 记录审计日志
  try {
    await addLog('CLAIM', `${shipId} - ${claimer}`, itemId, qty, remark ?? '');
  } catch (e) {
    console.warn('addLog failed (CLAIM):', e?.message || e);
  }

  return ok(res, { data: true }, { message: '申领物资成功' });
}));

export default router;
