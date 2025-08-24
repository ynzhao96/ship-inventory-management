import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from '../utils.js';

const router = Router();

// 批量添加入库
router.post('/createInboundBatch', asyncHandler(async (req, res) => {
  const { batchNo, shipId, items } = req.body || {};

  // 基本校验
  if (!batchNo || !shipId || !Array.isArray(items) || items.length === 0) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'batchNo, shipId, items 必填且 items 需为非空数组' });
  }
  for (let i = 0; i < items.length; i++) {
    const it = items[i] || {};
    if (it.itemId == null || it.quantity == null) {
      return fail(res, 400, { code: 'BAD_ITEM', message: `第 ${i + 1} 项缺少 itemId/quantity` });
    }
    const qty = Number(it.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return fail(res, 400, { code: 'BAD_QTY', message: `第 ${i + 1} 项 quantity 必须为正数` });
    }
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 显式列名 + 参数化，占位符数量与列完全一致
    const placeholders = [];
    const params = [];
    for (const it of items) {
      placeholders.push('(?, ?, ?, ?, ?, NOW())');
      params.push(
        batchNo,           // batch_no
        shipId,            // ship_id
        it.itemId,         // item_id  (注意：驼峰 -> 下划线)
        Number(it.quantity), // quantity
        'PENDING'          // status
      );
    }

    const insertSql = `
      INSERT INTO inbounds
        (batch_no, ship_id, item_id, quantity, status, created_at)
      VALUES ${placeholders.join(',')}
    `;
    const [ins] = await conn.query(insertSql, params);

    const firstId = Number(ins.insertId);
    const lastId = firstId + Number(ins.affectedRows) - 1;

    const [list] = await conn.query(
      `SELECT inbound_id AS inboundId,
              batch_no  AS batchNo,
              ship_id   AS shipId,
              item_id   AS itemId,
              quantity,
              status,
              created_at AS createdAt,
              confirmed_at AS confirmedAt
       FROM inbounds
       WHERE inbound_id BETWEEN ? AND ?
       ORDER BY inbound_id ASC`,
      [firstId, lastId]
    );

    await conn.commit();
    log();
    return ok(res, { data: { batchNo, shipId, items: list } }, { message: '创建入库批次成功' });
  } catch (err) {
    await conn.rollback();
    console.error('createInboundBatch error:', {
      code: err?.code, errno: err?.errno, message: err?.sqlMessage || err?.message, sql: err?.sql,
    });
    return fail(res, 500, { code: 'DB_ERROR', message: err?.sqlMessage || '数据库错误' });
  } finally {
    conn.release();
  }

  // 记录日志
  function log() {
    let itemListLog = [];
    for (const it of items) {
      itemListLog.push(it.itemId + '*' + it.quantity);
    }
    addLog('INBOUND_CREATED', 'admin', batchNo, null, `管理员添加物资入库，${itemListLog.join(',')}`);
  }
}));



export default router;
