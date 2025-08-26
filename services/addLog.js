import { Router } from 'express';
import { ok, fail, asyncHandler, q, withTransaction, addLog } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 新增日志
router.post('/addLog', asyncHandler(async (req, res) => {
  const { eventType, operator, object, quantity, note } = req.body || {};

  addLog(eventType, operator, object, quantity, note);

  return ok(res, { data: true }, { message: '新增日志成功' });
}));

export default router;
