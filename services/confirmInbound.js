// services/confirmInbound.js
import { Router } from 'express';
import { ok, fail, asyncHandler, q, addLog, withTransaction } from '../utils.js';

const router = Router();

// 确认入库
router.post('/confirmInbound', asyncHandler(async (req, res) => {
  let { inboundId, actualQuantity, remark } = req.body || {};
  inboundId = String(inboundId ?? '').trim();
  const qty = Number(actualQuantity);

  if (!inboundId) return fail(res, 400, { code: 'BAD_REQUEST', message: 'inboundId 必填' });
  if (!Number.isFinite(qty) || qty <= 0) {
    return fail(res, 400, { code: 'BAD_QTY', message: 'actualQuantity 必须为正数' });
  }

  let inbound;
  const result = await withTransaction(async (conn) => {
    // 1) 锁定该入库记录
    const rows = await q(
      `SELECT inbound_id, ship_id, item_id, status
         FROM inbounds
        WHERE inbound_id = ?
        FOR UPDATE`,
      [inboundId],
      conn
    );
    if (rows.length === 0) return { notFound: true };

    inbound = rows[0];
    if (String(inbound.status).toUpperCase() === 'CONFIRMED') {
      return { idempotent: true };
    }

    // 2) 将入库记录置为 CONFIRMED
    const upd = await q(
      `UPDATE inbounds
          SET status = 'CONFIRMED',
              actual_quantity = ?,
              remark = ?,
              confirmed_at = NOW()
        WHERE inbound_id = ?
          AND status <> 'CONFIRMED'`,
      [qty, remark ?? null, inboundId],
      conn
    );
    if (upd.affectedRows === 0) return { conflict: true };

    // 3) 库存累加（UPSERT）
    await q(
      `INSERT INTO inventory (ship_id, item_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [inbound.ship_id, inbound.item_id, qty],
      conn
    );

    return { ok: true, inbound };
  });

  if (result?.notFound) {
    return fail(res, 404, { code: 'NOT_FOUND', message: '入库记录不存在' });
  }
  if (result?.conflict) {
    return fail(res, 409, { code: 'ALREADY_CONFIRMED', message: '该入库记录已被确认' });
  }
  if (result?.idempotent) {
    return ok(res, { data: true }, { message: '该入库记录已确认（幂等返回）' });
  }

  // 成功时记一条审计日志（非关键路径，失败不影响响应）
  try {
    await addLog('INBOUND_CONFIRMED', inbound.ship_id, inboundId, qty, remark ?? '');
  } catch (e) {
    console.warn('addLog failed (INBOUND_CONFIRMED):', e?.message || e);
  }

  return ok(res, { data: true }, { message: '确认入库成功' });
}));

export default router;
