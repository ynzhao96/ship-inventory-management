import express from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from './utils.js';
import pool from './db.js';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// 管理员登录
app.post('/adminLogin', asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  const check = requireFields(req.body, ['username', 'password']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: '用户名和密码必填' });
  }

  const rows = await q(
    'SELECT username, password, type FROM users WHERE username = ? and type = 0 LIMIT 1',
    [username]
  );
  if (rows.length === 0) {
    return fail(res, 404, { code: 'USER_NOT_FOUND', message: '账号不存在' });
  }

  const user = rows[0];
  // ⚠️ 生产请改为 bcrypt.compare
  if (user.password !== password) {
    return fail(res, 401, { code: 'INVALID_PASSWORD', message: '密码错误' });
  }

  return ok(res, {
    user: { username: user.username, type: user.type },
    // 生产建议返回 JWT：token: 'xxx'
  }, { message: '登录成功' });
}));

// 登录接口
app.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  const check = requireFields(req.body, ['username', 'password']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: '用户名和密码必填' });
  }

  const rows = await q(
    'SELECT username, password, ship_id, type FROM users WHERE username = ? and type = 1 LIMIT 1',
    [username]
  );

  if (rows.length === 0) {
    return fail(res, 404, { code: 'USER_NOT_FOUND', message: '账号不存在' });
  }

  const user = rows[0];
  // ⚠️ 生产请改为 bcrypt.compare
  if (user.password !== password) {
    return fail(res, 401, { code: 'INVALID_PASSWORD', message: '密码错误' });
  }

  return ok(res, {
    data: { shipId: user.ship_id, type: user.type },
    // 生产建议返回 JWT：token: 'xxx'
  }, { message: '登录成功' });
});

// 获取用户账户密码信息
app.get('/getUserInfo', async (req, res) => {
  const { shipId } = req.query || {};

  const check = requireFields(req.query, ['shipId']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing shipId' });
  }

  const rows = await q('SELECT * FROM users WHERE ship_id = ?', [shipId]);
  return ok(res, { data: rows?.[0] || {} }, { message: 'User info fetched successfully' });
});

// 更新用户账号密码信息
app.post('/updateUserInfo', async (req, res) => {
  const { shipId, username, password } = req.body || {};
  if (!shipId) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'shipId必填' });
  }

  try {
    const rows = await q(
      'SELECT username, ship_id, type FROM users WHERE ship_id = ? AND type = 1 LIMIT 1',
      [shipId]
    );
    const newUser = rows.length === 0;

    if (newUser) {
      // 新增分支：username/password 必填
      if (!username || !password) {
        return fail(res, 400, { code: 'BAD_REQUEST', message: '新增需要提供 username 和 password' });
      }
      const ins = await q(
        'INSERT INTO users (ship_id, username, password, type) VALUES (?, ?, ?, 1)',
        [shipId, username, password]
      );
      // ins.insertId 可用（若你需要）
    } else {
      // 更新分支：至少需要一个字段
      if ((username == null || username === '') && (password == null || password === '')) {
        return fail(res, 400, { code: 'BAD_REQUEST', message: '请至少提供 username 或 password 之一' });
      }
      const sets = [];
      const params = [];
      if (username != null && username !== '') { sets.push('username = ?'); params.push(username); }
      if (password != null && password !== '') { sets.push('password = ?'); params.push(password); }
      params.push(shipId);

      const upd = await q(
        `UPDATE users SET ${sets.join(', ')} WHERE ship_id = ? AND type = 1 LIMIT 1`,
        params
      );
      // upd.affectedRows 可用（若你需要）
    }

    const [ret] = await q(
      'SELECT ship_id, username, type FROM users WHERE ship_id = ? AND type = 1 LIMIT 1',
      [shipId]
    );
    return ok(res, { data: ret }, { message: newUser ? '创建用户成功' : '更新用户成功' });

  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return fail(res, 409, { code: 'DUPLICATE', message: '用户名已存在' });
    }
    console.error('updateUserInfo error:', err);
    return fail(res, 500, { code: 'DB_ERROR', message: '数据库错误' });
  }
});

// 获取船舶列表
app.get('/getShipList', asyncHandler(async (_req, res) => {
  const rows = await q('SELECT * FROM ships');
  return ok(res, {
    totalShips: rows.length,
    data: rows,
  }, { message: '获取船舶列表成功' });
}));

// 获取船舶信息
app.get('/getShipInfo', asyncHandler(async (req, res) => {
  const { id } = req.query || {};
  const check = requireFields(req.query, ['id']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing id' });
  }

  const rows = await q('SELECT * FROM ships WHERE id = ?', [id]);
  if (rows.length === 0) {
    return fail(res, 404, { code: 'NOT_FOUND', message: 'Ship not found' });
  }

  return ok(res, { data: rows[0] }, { message: 'Ship info fetched successfully' });
}));

// 批量添加入库
app.post('/createInboundBatch', async (req, res) => {
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
});

// 获取待入库信息
app.get('/getInboundList', async (req, res) => {
  const { shipId } = req.query || {};
  const rows = await q(`SELECT 
    inbound_id AS inboundId,
    batch_no AS batchNumber,
    item_id AS itemId,
    quantity,
    status,
    created_at AS createdAt
    FROM inbounds 
    WHERE ship_id = ? and status = 'PENDING'`,
    [shipId]
  );
  return ok(res, {
    totalInbounds: rows.length,
    data: rows,
  }, { message: '获取待入库信息成功' });
});

// 确认入库
app.post('/confirmInbound', async (req, res) => {
  let { inboundId, actualQuantity, remark } = req.body || {};

  // 基础校验
  inboundId = String(inboundId ?? '').trim();
  const qty = Number(actualQuantity);
  if (!inboundId) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'inboundId 必填' });
  }
  if (!Number.isFinite(qty) || qty <= 0) {
    return fail(res, 400, { code: 'BAD_QTY', message: 'actualQuantity 必须为正数' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) 锁定该入库记录，拿到 ship_id/item_id/status
    const [rows] = await conn.query(
      `SELECT inbound_id, ship_id, item_id, status
         FROM inbounds
        WHERE inbound_id = ?
        FOR UPDATE`,
      [inboundId]
    );
    if (!rows || rows.length === 0) {
      await conn.rollback();
      return fail(res, 404, { code: 'NOT_FOUND', message: '入库记录不存在' });
    }
    const inbound = rows[0];

    // 幂等处理：已确认则不再重复累加库存
    if (String(inbound.status).toUpperCase() === 'CONFIRMED') {
      await conn.commit();
      return ok(res, { data: true }, { message: '该入库记录已确认（幂等返回）' });
    }

    // 2) 更新 inbounds 状态为 CONFIRMED（只允许从非 CONFIRMED 变更）
    const [u] = await conn.query(
      `UPDATE inbounds
          SET status = 'CONFIRMED',
              actual_quantity = ?,
              remark = ?,
              confirmed_at = NOW()
        WHERE inbound_id = ?
          AND status <> 'CONFIRMED'`,
      [qty, remark ?? null, inboundId]
    );
    if (u.affectedRows === 0) {
      // 理论上不会到这里（因为前面锁定后检查过），兜底处理
      await conn.rollback();
      return fail(res, 409, { code: 'ALREADY_CONFIRMED', message: '该入库记录已被确认' });
    }

    // 3) UPSERT 到 inventory：不存在则插入，存在则累加
    //    用 VALUES(quantity) 表示本次增量，ON DUPLICATE 时做 quantity = quantity + 增量
    await conn.query(
      `INSERT INTO inventory (ship_id, item_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         quantity   = quantity + VALUES(quantity)`,
      [inbound.ship_id, inbound.item_id, qty]
    );

    await conn.commit();
    return ok(res, { data: true }, { message: '确认入库成功' });
  } catch (err) {
    await conn.rollback();
    console.error('confirmInbound error:', {
      code: err?.code, errno: err?.errno, message: err?.sqlMessage || err?.message, sql: err?.sql,
    });
    return fail(res, 500, { code: err?.code || 'DB_ERROR', message: err?.sqlMessage || '数据库错误' });
  } finally {
    conn.release();
  }
});

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

// 获取全部库存接口
app.post('/getInventoryList', async (req, res) => {
  const rawShipId = req.body?.shipId;
  const keyword = req.body?.keyword;
  function normalizeId(input) {
    if (input && typeof input === 'object') {
      const v = input.shipId ?? input.id ?? input.value ?? input.key;
      return v != null ? String(v).trim() : '';
    }
    return String(input ?? '').trim();
  }

  const shipId = normalizeId(rawShipId);
  if (!shipId) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing shipId' });
  }

  const where = ['TRIM(inv.ship_id) = ?']; // 双保险：列也 TRIM 一次
  const params = [shipId];

  if (keyword && String(keyword).trim() !== '') {
    const kw = `%${String(keyword).trim()}%`;
    where.push('(it.item_id LIKE ? OR it.item_name LIKE ? OR it.item_name_en LIKE ?)');
    params.push(kw, kw, kw);
  }

  const sql = `
    SELECT
      inv.ship_id              AS shipId,
      inv.item_id              AS itemId,
      inv.quantity             AS quantity,
      inv.remark               AS remark,
      it.item_name             AS itemName,
      it.item_name_en          AS itemNameEn,
      it.category_id           AS categoryId,
      it.unit                  AS unit,
      it.specification         AS specification
    FROM inventory AS inv
    JOIN items AS it
      ON it.item_id = inv.item_id
    WHERE ${where.join(' AND ')}
    ORDER BY it.item_name ASC, it.item_id ASC
  `;

  try {
    const rows = await q(sql, params);
    return ok(res, { data: rows }, { message: 'Inventory fetched successfully' });
  } catch (err) {
    console.error('getInventoryList error:', {
      code: err?.code, errno: err?.errno, message: err?.sqlMessage || err?.message, sql: err?.sql,
    });
    return fail(res, 500, { code: err?.code || 'DB_ERROR', message: err?.sqlMessage || '数据库错误' });
  }
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

// 申领物资接口
app.post('/claimItem', async (req, res) => {
  const { shipId, itemId, quantity, remark, claimer } = req.body;
  const check = requireFields(req.body, [shipId, itemId, quantity, claimer]);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'shipId, itemId, quantity, claimer必填' });
  }
  const row = await q('SELECT quantity FROM inventory WHERE ship_id = ? AND item_id = ?', [shipId, itemId]);
  if (row.length === 0) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: '对应物资不存在' });
  }
  if (quantity > row[0].quantity) {
    return fail(res, 400, { code: 'BAD_QTY', message: 'quantity必须小于等于库存数量' });
  }

  try {
    q('UPDATE inventory SET inventory = ? WHERE ship_id = ? AND item_id = ?', [row[0].quantity - quantity, shipId, itemId]).then(() => {
      addLog('CLAIM', `${shipId} - ${claimer}`, itemId, quantity, remark);

      return ok(res, { data: true }, { message: '申领物资成功' });
    })
  } catch (err) {
    return fail(res, 500, { code: err?.code || 'DB_ERROR', message: err?.sqlMessage || '数据库错误' });
  }
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