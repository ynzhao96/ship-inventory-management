import { Router } from 'express';
import { ok, fail, asyncHandler, q, withTransaction, addLog, requireFields } from '../utils.js';

const router = Router();

// 新增日志
router.post('/addThreshold', asyncHandler(async (req, res) => {
  const { shipId, itemId, threshold } = req.body || {};

  const check = requireFields(req.body, ['shipId', 'itemId', 'threshold']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'shipId, itemId, threshold都必填' });
  }

  const rows = await q(
    'SELECT threshold FROM inventory WHERE ship_id = ? and item_id = ?',
    [shipId, itemId]
  );
  if (rows.length === 0) {
    return fail(res, 422, { code: 'NOT_FOUND', message: '未找到对应记录' });
  }

  try {
    const upd = await q('UPDATE inventory SET threshold = ? WHERE ship_id = ? AND item_id = ?', [threshold, shipId, itemId]);
    return ok(res, { data: true }, { message: '新增预警值成功' });
  } catch (err) {
    return fail(res, 500, { code: 'DB_ERROR', message: '数据库错误' });
  }

}));

export default router;
