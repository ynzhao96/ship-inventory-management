import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog, normalizeCategoryIds } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 获取物料指南
router.post('/getItemList', asyncHandler(async (req, res) => {
  let page = req.body?.page ?? 1;
  let pageSize = req.body?.pageSize ?? 10;
  const searchMatch = req.body?.searchMatch;
  const categoryIdInput = req.body?.categoryId;

  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
  const offset = (page - 1) * pageSize;

  const where = [];
  const params = [];

  // 关键词模糊匹配
  const keyword = typeof searchMatch === 'string' ? searchMatch.trim() : '';
  if (keyword && String(keyword).trim() !== '') {
    const kw = `%${String(keyword).trim()}%`;
    where.push('(it.item_id LIKE ? OR it.item_name LIKE ? OR it.item_name_en LIKE ?)');
    params.push(kw, kw, kw);
  }

  // 类别过滤
  const categoryId = normalizeCategoryIds(categoryIdInput);
  where.push('it.category_id = ?');
  params.push(categoryId);

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // 统计总数
  const countSql = `
      SELECT COUNT(1) AS total
        FROM items
      ${whereSql}
    `;
  const [{ total }] = await q(countSql);

  const listSql = `
      SELECT
        it.item_id                           AS itemId,
        it.item_name                         AS itemName,
        it.item_name_en                      AS itemNameEn,
        it.unit                              AS unit,
        it.specification                     AS specification,
        cat.name                             AS categoryName
      FROM items AS it
      LEFT JOIN categories AS cat
        ON it.category_id = cat.id
      ${whereSql}
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
