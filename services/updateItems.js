import { Router } from 'express';
import { ok, fail, asyncHandler, q, withTransaction, addLog } from '../utils.js';

const router = Router();

// 更新物料信息
router.post('/updateItems', asyncHandler(async (req, res) => {
  const { items } = req.body ?? {};

  // 1) 基础校验
  if (!Array.isArray(items) || items.length === 0) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'items 必须为非空数组' });
  }

  // 可选：限制单次批量大小，避免 SQL 过长
  const MAX_BATCH = 500;
  if (items.length > MAX_BATCH) {
    return fail(res, 400, { code: 'TOO_MANY', message: `单次最多 ${MAX_BATCH} 条，请分批提交` });
  }

  // 2) 归一化
  const trimOrNull = (v) => (v == null ? null : String(v).trim());
  const normItem = (raw) => {
    const id = raw?.itemId ?? raw?.item_id ?? raw?.id;
    return {
      item_id: trimOrNull(id),                               // 必填
      item_name: trimOrNull(raw?.itemName ?? raw?.item_name),
      item_name_en: trimOrNull(raw?.itemNameEn ?? raw?.item_name_en),
      unit: trimOrNull(raw?.unit),
      specification: trimOrNull(raw?.specification),
    };
  };

  // 3) 清洗 + 去重
  const map = new Map(); // key: item_id -> row
  for (const r of items) {
    const row = normItem(r);
    if (!row.item_id) continue;
    map.set(row.item_id, row);
  }
  const rows = [...map.values()];
  if (rows.length === 0) {
    return fail(res, 400, { code: 'BAD_ITEMS', message: 'items 中没有有效的 itemId' });
  }

  // 4) 批量 UPSERT SQL
  const cols = ['item_id', 'item_name', 'item_name_en', 'unit', 'specification'];
  const rowPH = `(${cols.map(() => '?').join(', ')})`;
  const placeholders = rows.map(() => rowPH).join(', ');
  const params = [];
  for (const r of rows) {
    params.push(r.item_id, r.item_name, r.item_name_en, r.unit, r.specification);
  }

  const insertSql = `
    INSERT INTO items (${cols.join(', ')})
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      item_name     = COALESCE(VALUES(item_name), item_name),
      item_name_en  = COALESCE(VALUES(item_name_en), item_name_en),
      unit          = COALESCE(VALUES(unit), unit),
      specification = COALESCE(VALUES(specification), specification)
  `;

  // 5) 事务执行（用 q 在同一连接里跑所有 SQL）
  const list = await withTransaction(async (conn) => {
    await q(insertSql, params, conn);

    const ids = rows.map(r => r.item_id);
    const inPH = ids.map(() => '?').join(', ');

    const list = await q(
      `SELECT item_id AS itemId,
              item_name AS itemName,
              item_name_en AS itemNameEn,
              unit,
              specification
       FROM items
       WHERE item_id IN (${inPH})
       ORDER BY item_id ASC`,
      ids,
      conn
    );

    return list;
  });

  return ok(res, { data: { count: list.length, items: list } }, { message: '批量创建或更新成功' });
}));

export default router;
