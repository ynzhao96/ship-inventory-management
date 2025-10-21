import { Router } from 'express';
import { ok, fail, asyncHandler, q, withTransaction, addLog, requireFields } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

/**
 * 批量更新“预警阈值”：
 * - 行为与 updateCrews 一致：以提交列表为准
 *   - 提交中出现的 itemId => 设置为对应 threshold（可为 0）
 *   - 提交中未出现、但当前有阈值的 itemId => 视为删除阈值（置 NULL）
 * - 允许 items 为空数组：表示清空该船所有已有阈值
 */
router.post('/updateThreshold', asyncHandler(async (req, res) => {
  const { shipId, items } = req.body || {};

  // 基础校验
  const check = requireFields(req.body, ['shipId', 'items']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'shipId 与 items 必填' });
  }
  if (!Array.isArray(items)) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'items 必须是数组（可为空数组）' });
  }

  // 逐项校验结构与阈值合法性
  const invalidItems = [];
  for (const it of items) {
    if (!it || typeof it.itemId === 'undefined' || typeof it.threshold === 'undefined') {
      invalidItems.push({ item: it, reason: '缺少 itemId 或 threshold' });
      continue;
    }
    const t = Number(it.threshold); // 允许 0
    if (Number.isNaN(t)) {
      invalidItems.push({ item: it, reason: 'threshold 不是数字' });
    }
  }
  if (invalidItems.length > 0) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: '部分 items 非法', details: { invalidItems } });
  }

  // 取提交的 itemId 列表
  const incomingIds = items.map(i => String(i.itemId));

  // 1) 校验这些 item 是否存在于该船 inventory（保持你原来的严格风格：全有或全无）
  if (incomingIds.length > 0) {
    const ph = incomingIds.map(() => '?').join(',');
    const existRows = await q(
      `SELECT item_id AS itemId
         FROM inventory
        WHERE ship_id = ?
          AND item_id IN (${ph})`,
      [shipId, ...incomingIds]
    );
    const existSet = new Set(existRows.map(r => String(r.itemId)));
    const notFound = incomingIds.filter(id => !existSet.has(id));
    if (notFound.length > 0) {
      return fail(res, 422, { code: 'NOT_FOUND', message: '存在未找到的记录', details: { notFound } });
    }
  }

  // 2) 找出“当前已有阈值”的 itemId 集合（只清理这些里不在 incoming 的）
  const currentRows = await q(
    `SELECT item_id AS itemId
       FROM inventory
      WHERE ship_id = ?
        AND threshold IS NOT NULL`,
    [shipId]
  );
  const currentSet = new Set(currentRows.map(r => String(r.itemId)));
  const incomingSet = new Set(incomingIds);

  // 需要清空阈值的：当前有阈值但这次没提交
  const toClear = [...currentSet].filter(id => !incomingSet.has(id));

  // 3) 事务：先清空，再逐项设置
  let updatedCount = 0;
  let clearedCount = 0;

  try {
    await withTransaction(async (conn) => {
      // 清空缺席项
      if (toClear.length > 0) {
        const ph = toClear.map(() => '?').join(',');
        await q(
          `UPDATE inventory
              SET threshold = NULL
            WHERE ship_id = ?
              AND item_id IN (${ph})`,
          [shipId, ...toClear],
          conn
        );
        clearedCount = toClear.length;
      }

      // 设置/更新提交项
      for (const it of items) {
        await q(
          `UPDATE inventory
              SET threshold = ?
            WHERE ship_id = ?
              AND item_id = ?`,
          [Number(it.threshold), shipId, it.itemId],
          conn
        );
        updatedCount++;
      }

      // 写操作日志（可选）
      try {
        // await addLog?.(conn, {
        //   module: 'inventory',
        //   action: 'update_threshold_sync',
        //   remark: `shipId=${shipId}, updated=${updatedCount}, cleared=${clearedCount}`,
        //   payload: JSON.stringify({ items, toClear }),
        // });
      } catch { /* 忽略日志错误 */ }
    });

    // 回读最新阈值列表（便于前端同步状态）
    const latest = await q(
      `SELECT item_id AS itemId, threshold
         FROM inventory
        WHERE ship_id = ?
          AND threshold IS NOT NULL
        ORDER BY item_id ASC`,
      [shipId]
    );

    return ok(
      res,
      { data: { updatedCount, clearedCount, list: latest } },
      { message: '阈值已按提交列表同步（缺席项已清空）' }
    );
  } catch (err) {
    return fail(res, 500, { code: 'DB_ERROR', message: '数据库错误' });
  }
}));

export default router;
