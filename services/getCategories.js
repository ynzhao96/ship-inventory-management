import { Router } from 'express';
import { ok, fail, asyncHandler, q, addLog, withTransaction, requireFields } from '../utils.js';

const router = Router();

// 获取库存类型
router.get('/getCategories', asyncHandler(async (_req, res) => {
  const rows = await q(`SELECT 
    id AS categoryId,
    name AS categoryName,
    name_en AS categoryNameEn
    FROM categories`
  );
  return ok(res, { data: rows }, { message: '获取库存类型成功' });
}));

export default router;
