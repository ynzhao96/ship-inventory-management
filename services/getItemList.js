import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 获取物料指南
router.post('/getItemList', asyncHandler(async (req, res) => {
  let { page = 1, pageSize = 10 } = req.body ?? {};

  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
  const offset = (page - 1) * pageSize;

  // 统计总数
  const countSql = `
      SELECT COUNT(1) AS total
        FROM items
    `;
  const [{ total }] = await q(countSql);

  specification
  category_id
  const listSql = `
      SELECT
        it.item_id                           AS itemId,
        it.item_name                         AS itemName,
        it.item_id_en                        AS itemNameEn,
        it.unit                              AS unit,
        it.specification                     AS specification,
        cat.name                             AS categoryName
      FROM items AS it
      JOIN categories AS cat
        ON it.category_id = cat.id
      LIMIT ? OFFSET ?
    `;
  const rows = await q(listSql, [pageSize, offset]);

  return ok(
    res,
    {
      data: {
        list: rows,
        page,
        pageSize,
        total: Number(total) || 0,
        totalPages: Math.ceil((Number(total) || 0) / pageSize),
      },
    },
    { message: '查询物料指南成功' },
  );
}));

export default router;
