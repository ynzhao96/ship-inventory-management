// servers/inbound.js
import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog, withTransaction } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

router.post('/createInboundBatch', asyncHandler(async (req, res) => {
  const { batchNo, creator, shipId, items } = req.body || {};
  if (!batchNo || !creator || !shipId || !Array.isArray(items) || items.length === 0) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'batchNo, creator, shipId, items 必填且 items 需为非空数组' });
  }
  for (let i = 0; i < items.length; i++) {
    const it = items[i] || {};
    const qty = Number(it.quantity);
    if (it.itemId == null || it.quantity == null || !Number.isFinite(qty) || qty <= 0) {
      return fail(res, 400, { code: 'BAD_ITEM', message: `第 ${i + 1} 项缺少或非法 itemId/quantity` });
    }
  }

  const { list } = await withTransaction(async (conn) => {
    // 批量 INSERT
    const placeholders = items.map(() => '(?, ?, ?, ?, ?, ?, NOW())').join(',');
    const params = items.flatMap(it => [batchNo, creator, shipId, it.itemId, Number(it.quantity), 'PENDING']);

    const ins = await q(
      `INSERT INTO inbounds
         (batch_no, creator, ship_id, item_id, quantity, status, created_at)
       VALUES ${placeholders}`,
      params, conn
    ); // ins.insertId / ins.affectedRows 可用

    const firstId = Number(ins.insertId);
    const lastId = firstId + Number(ins.affectedRows) - 1;

    const list = await q(
      `SELECT inbound_id AS inboundId, batch_no AS batchNo, creator, ship_id AS shipId,
              item_id AS itemId, quantity, status, created_at AS createdAt, confirmed_at AS confirmedAt
         FROM inbounds
        WHERE inbound_id BETWEEN ? AND ?
        ORDER BY inbound_id ASC`,
      [firstId, lastId], conn
    );

    return { list };
  });

  // 事务外写审计（或也可把 addLog 做成可接收 conn 的版本，放进事务）
  const itemListLog = items.map(it => `${it.itemId}*${it.quantity}`).join(',');
  try {
    await addLog('INBOUND_CREATED', creator, batchNo, null, `管理员${creator}添加物资入库，${itemListLog}`);
  } catch (e) {
    console.warn('addLog failed:', e?.message || e);
  }

  return ok(res, { data: { batchNo, creator, shipId, items: list } }, { message: '创建入库批次成功' });
}));

export default router;
