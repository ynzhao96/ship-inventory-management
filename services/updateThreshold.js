import { Router } from 'express';
import { ok, fail, asyncHandler, q, withTransaction, addLog, requireFields } from '../utils.js';

const router = Router();

// 新增日志
router.post('/updateThreshold', asyncHandler(async (req, res) => {
  const { shipId, items } = req.body || {};

  // 基础校验
  const check = requireFields(req.body, ['shipId', 'items']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'shipId 与 items 必填' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'items 必须为非空数组' });
  }

  // 逐项校验结构与阈值合法性
  const invalidItems = [];
  for (const it of items) {
    if (!it || typeof it.itemId === 'undefined' || typeof it.threshold === 'undefined') {
      invalidItems.push({ item: it, reason: '缺少 itemId 或 threshold' });
      continue;
    }
    // 允许 0；转换成数字并检查 NaN
    const t = Number(it.threshold);
    if (Number.isNaN(t)) {
      invalidItems.push({ item: it, reason: 'threshold 不是数字' });
    }
  }
  if (invalidItems.length > 0) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: '部分 items 非法', details: { invalidItems } });
  }

  // 查询这些 item 是否都存在于该船的 inventory 中
  // 先取出所有 itemId
  const itemIds = items.map(i => i.itemId);

  // 使用 IN 查询存在性
  // 注意：ship_id + item_id 共同限定
  const placeholders = itemIds.map(() => '?').join(',');
  const existRows = await q(
    `SELECT item_id AS itemId 
       FROM inventory 
      WHERE ship_id = ? 
        AND item_id IN (${placeholders})`,
    [shipId, ...itemIds]
  );

  const existSet = new Set(existRows.map(r => String(r.itemId)));
  const notFound = items
    .filter(i => !existSet.has(String(i.itemId)))
    .map(i => i.itemId);

  if (notFound.length > 0) {
    // 若你倾向“部分存在也可更新”，可不直接失败，而是仅更新存在的并返回明细
    // 这里给出更严格的全有或全无策略：存在缺失则直接 422
    return fail(res, 422, { code: 'NOT_FOUND', message: '存在未找到的记录', details: { notFound } });
  }

  // 全部存在 -> 开启事务批量更新
  try {
    await withTransaction(async (conn) => {
      for (const it of items) {
        await q(
          'UPDATE inventory SET threshold = ? WHERE ship_id = ? AND item_id = ?',
          [Number(it.threshold), shipId, it.itemId],
          conn
        );
      }

      // 写一条操作日志（可选）
      try {
        await addLog?.(
          conn,
          {
            module: 'inventory',
            action: 'update_threshold_bulk',
            remark: `shipId=${shipId}, count=${items.length}`,
            payload: JSON.stringify(items),
          }
        );
      } catch { }
    });

    return ok(res, {
      data: { updatedCount: items.length }
    }, { message: '批量更新预警值成功' });

  } catch (err) {
    return fail(res, 500, { code: 'DB_ERROR', message: '数据库错误' });
  }
}));

export default router;
