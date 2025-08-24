import express from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from './utils.js';
import pool from './db.js';
import servers from './services/index.js';

const app = express();
const port = 3000;

app.use(express.json());

app.use('/', servers);

// 获取首页信息接口
app.post('/getHomeInfo', (req, res) => {
  const { shipID } = req.body;
  // 假设我们有一个船舶信息列表
  const ships = [{ shipID: '1233332', shipName: '船名' }];
  const ship = ships.find(s => s.shipID === shipID);
  if (ship) {
    res.json({ data: { userName: 'abcdefg', shipInfo: { shipID: ship.shipID, shipName: ship.shipName }, totalInventory: '1234', totalConfirm: '10' } });
  } else {
    res.status(404).json({ code: 404, message: '船舶信息未找到' });
  }
});

// 获取低库存预警接口
app.post('/getLowInventory', (req, res) => {
  const { shipID } = req.body;
  console.log(shipID);
  // 假设我们有一个低库存预警信息列表
  const lowInventoryWarnings = [{ itemID: '330456', itemName: '电动空气压缩机', threshold: 15, quantity: 3 }];
  res.json({ data: lowInventoryWarnings });
});

// 撤销入库接口
app.post('/cancelConfirm', (req, res) => {
  const { shipID, confirmID, remark } = req.body;
  console.log(shipID, confirmID, remark);
  // 这里可以添加撤销入库的逻辑
  res.json({ code: 200, message: '撤销入库成功', data: true });
});

// 查看入库历史接口
app.post('/getConfirmLog', (req, res) => {
  const { shipID, startTime, endTime } = req.body;
  console.log(shipID, startTime, endTime);
  // 这里可以添加查看入库历史的逻辑
  res.json({ code: 200, data: [{ confirmID: '33045ssx6', itemID: '330456', itemName: '电动空气压缩机', quantity: '20', remark: '确认入库备注信息', batchNumber: 'LOT-20230615-001', submitDate: '2023-07-15 09:30', confirmDate: '2023-08-15 09:30' }] });
});

// 撤销申领接口
app.post('/cancelClaim', (req, res) => {
  const { shipID, claimID, remark } = req.body;
  console.log(shipID, claimID, remark);
  // 这里可以添加撤销申领的逻辑
  res.json({ code: 200, message: '撤销申领成功', data: true });
});

// 获取船员列表接口
app.get('/getCrewList', async (req, res) => {
  const { shipId } = req.query || {};

  const check = requireFields(req.query, ['shipId']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing shipId' });
  }

  const rows = await q('SELECT * FROM crews WHERE ship_id = ?', [shipId]);
  return ok(res, { data: rows }, { message: 'Ship info fetched successfully' });
});

// 更新船员接口
app.post('/updateCrews', async (req, res) => {
  const { shipId, crews } = req.body || {};

  // 基本校验
  if (!shipId) {
    return res.status(400).json({ success: false, code: 'BAD_REQUEST', message: 'Missing shipId' });
  }
  if (!Array.isArray(crews)) {
    return res.status(400).json({ success: false, code: 'BAD_REQUEST', message: 'crews 必须是数组' });
  }
  for (let i = 0; i < crews.length; i++) {
    const c = crews[i] || {};
    if (!c.name || !c.position) {
      return res.status(400).json({ success: false, code: 'BAD_REQUEST', message: `第 ${i + 1} 项缺少 name/position` });
    }
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) 读取该船当前已有的 id 集合
    const [existingRows] = await conn.query(
      'SELECT id FROM crews WHERE ship_id = ?',
      [shipId]
    );
    const existingIds = new Set(existingRows.map(r => r.id));
    const incomingIds = new Set(
      crews.filter(c => c.id != null).map(c => Number(c.id))
    );

    // 2) 删除：现有但未提交的 id
    const toDelete = [...existingIds].filter(id => !incomingIds.has(id));
    if (toDelete.length > 0) {
      await conn.query(
        `DELETE FROM crews WHERE ship_id = ? AND id IN (${toDelete.map(() => '?').join(',')})`,
        [shipId, ...toDelete]
      );
    }

    // 3) 更新/插入
    for (const c of crews) {
      if (c.id != null) {
        // 更新（限定 ship_id，避免越权/错改）
        await conn.query(
          'UPDATE crews SET name = ?, position = ? WHERE id = ? AND ship_id = ?',
          [c.name, c.position, c.id, shipId]
        );
      } else {
        // 新增
        await conn.query(
          'INSERT INTO crews (ship_id, name, position) VALUES (?, ?, ?)',
          [shipId, c.name, c.position]
        );
      }
    }

    // 4) 回读最新列表（含新生成的 id）
    const [list] = await conn.query(
      'SELECT id, name, position FROM crews WHERE ship_id = ? ORDER BY id ASC',
      [shipId]
    );

    await conn.commit();
    return res.status(200).json({
      success: true,
      code: 'OK',
      message: '保存成功',
      data: list
    });
  } catch (err) {
    await conn.rollback();
    console.error('updateCrews error:', err);
    return res.status(500).json({ success: false, code: 'DB_ERROR', message: '数据库错误' });
  } finally {
    conn.release();
  }
});

// 更新物料信息
app.post('/updateItems', async (req, res) => {
  const { items } = req.body || {};

  // 1) 基础校验
  if (!Array.isArray(items) || items.length === 0) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'items 必须为非空数组' });
  }

  // 可选：限制单次批量大小，避免 SQL 过长（按需调整/分片）
  const MAX_BATCH = 500;
  if (items.length > MAX_BATCH) {
    return fail(res, 400, { code: 'TOO_MANY', message: `单次最多 ${MAX_BATCH} 条，请分批提交` });
  }

  // 2) 归一化工具
  const trimOrNull = (v) => (v == null ? null : String(v).trim());
  const normItem = (raw) => {
    // 兼容多种入参命名：itemId/item_id/id
    const id = raw?.itemId ?? raw?.item_id ?? raw?.id;
    return {
      item_id: trimOrNull(id),                               // 必填
      item_name: trimOrNull(raw?.itemName ?? raw?.item_name),
      item_name_en: trimOrNull(raw?.itemNameEn ?? raw?.item_name_en),
      unit: trimOrNull(raw?.unit),
      specification: trimOrNull(raw?.specification),
    };
  };

  // 3) 清洗 + 过滤非法项 + 去重（后出现的覆盖先出现的）
  const map = new Map(); // key: item_id -> row
  for (const r of items) {
    const row = normItem(r);
    if (!row.item_id) continue; // 跳过无 item_id
    map.set(row.item_id, row);
  }
  const rows = Array.from(map.values());
  if (rows.length === 0) {
    return fail(res, 400, { code: 'BAD_ITEMS', message: 'items 中没有有效的 itemId' });
  }

  // 4) 组装批量 INSERT ... ON DUPLICATE KEY UPDATE
  // 列固定为这五个；未提供的值用 NULL 占位，配合 COALESCE 在更新时保持原值
  const cols = ['item_id', 'item_name', 'item_name_en', 'unit', 'specification'];
  const rowPH = `(${cols.map(() => '?').join(', ')})`;
  const placeholders = rows.map(() => rowPH).join(', ');
  const params = [];
  for (const r of rows) {
    params.push(r.item_id, r.item_name, r.item_name_en, r.unit, r.specification);
  }

  const sql = `
    INSERT INTO items (${cols.join(', ')})
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      item_name     = COALESCE(VALUES(item_name), item_name),
      item_name_en  = COALESCE(VALUES(item_name_en), item_name_en),
      unit          = COALESCE(VALUES(unit), unit),
      specification = COALESCE(VALUES(specification), specification)
  `;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [ret] = await conn.query(sql, params);

    // 回读本次涉及到的 item_id
    const ids = rows.map(r => r.item_id);
    const inPH = ids.map(() => '?').join(', ');
    const [list] = await conn.query(
      `SELECT item_id AS itemId,
              item_name AS itemName,
              item_name_en AS itemNameEn,
              unit,
              specification
       FROM items
       WHERE item_id IN (${inPH})
       ORDER BY item_id ASC`,
      ids
    );

    await conn.commit();

    // 受影响行数说明（插入计 1，更新计 2；无法精确拆分，此处返回汇总）
    // const affected = ret.affectedRows; // mysql2 返回
    return ok(res, { data: { count: list.length, items: list } }, { message: '批量创建或更新成功' });
  } catch (err) {
    await conn.rollback();
    console.error('updateItems(batch) error:', {
      code: err?.code, errno: err?.errno, message: err?.sqlMessage || err?.message, sql: err?.sql,
    });
    return fail(res, 500, { code: err?.code || 'DB_ERROR', message: err?.sqlMessage || '数据库错误' });
  } finally {
    conn.release();
  }
});

// 获取库存类型
app.get('/getCategories', async (req, res) => {
  const rows = await q(`SELECT 
    id AS categoryId,
    name AS categoryName,
    name_en AS categoryNameEn
    FROM categories`
  );
  return ok(res, { data: rows }, { message: '获取库存类型成功' });
});

// 查看申领历史接口
app.post('/getClaimLog', (req, res) => {
  const { shipID, startTime, endTime } = req.body;
  console.log(shipID, startTime, endTime);
  // 这里可以添加查看申领历史的逻辑
  res.json({ code: 200, data: [{ claimID: '330456', itemID: '330456', itemName: '牙刷', quantity: '20', remark: '申领详情', claimer: '大副', date: '2023-07-15 09:30' }] });
});

// 编辑库存备注
app.post('/editItemRemark', async (req, res) => {
  const { shipId, itemId, remark } = req.body || {};

  const check = requireFields(req.body, ['shipId', 'itemId']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing shipId or itemId' });
  }

  const rows = await q('SELECT * FROM inventory WHERE ship_id = ? AND item_id = ?', [shipId, itemId]);
  if (rows.length === 0) {
    return fail(res, 400, { code: 'BAD_ITEMS', message: '未找到对应的记录' });
  }
  const upd = await q('UPDATE inventory SET remark = ? WHERE ship_id = ? AND item_id = ?', [remark, shipId, itemId]);
  return ok(res, { data: true }, { message: '修改备注成功' });
});

// 新增日志
app.post('/addLog', async (req, res) => {
  const { eventType, operator, object, quantity, note } = req.body || {};

  addLog(eventType, operator, object, quantity, note);

  return ok(res, { data: true }, { message: '新增日志成功' });
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器正在运行在 http://localhost:${port}`);
}); 