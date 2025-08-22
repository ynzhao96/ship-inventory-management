import express from 'express';
import { ok, fail, asyncHandler, requireFields, q } from './utils.js';
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
    if (it.itemId == null || !it.itemName || it.quantity == null || !it.unit) {
      return fail(res, 400, { code: 'BAD_ITEM', message: `第 ${i + 1} 项缺少 itemId/itemName/quantity/unit` });
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
      placeholders.push('(?, ?, ?, ?, ?, ?, ?, NOW())');
      params.push(
        batchNo,           // batch_no
        shipId,            // ship_id
        it.itemId,         // item_id  (注意：驼峰 -> 下划线)
        it.itemName,       // item_name
        it.unit,           // unit
        Number(it.quantity), // quantity
        'PENDING'          // status
      );
    }

    const insertSql = `
      INSERT INTO inbounds
        (batch_no, ship_id, item_id, item_name, unit, quantity, status, created_at)
      VALUES ${placeholders.join(',')}
    `;
    const [ins] = await conn.query(insertSql, params);

    const firstId = Number(ins.insertId);
    const lastId = firstId + Number(ins.affectedRows) - 1;

    const [list] = await conn.query(
      `SELECT id,
              batch_no  AS batchNo,
              ship_id   AS shipId,
              item_id   AS itemId,
              item_name AS itemName,
              unit,
              quantity,
              status,
              created_at AS createdAt,
              confirmed_at AS confirmedAt
       FROM inbounds
       WHERE id BETWEEN ? AND ?
       ORDER BY id ASC`,
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
    confirm_id AS confirmId,
    batch_no AS batchNumber,
    item_id AS itemId,
    item_name AS itemName,
    item_name_en AS itemNameEn,
    unit,
    quantity,
    status,
    create_at AS createAt
    FROM inbounds 
    WHERE ship_id = ? and status = 'PENDING'`,
    [shipId]
  );
  return ok(res, {
    totalInbounds: rows.length,
    data: rows,
  }, { message: '获取待入库信息成功' });
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
app.post('/getInventoryList', (req, res) => {
  const { shipID } = req.body;
  console.log(shipID);
  // 假设我们有一个库存信息列表
  const inventoryList = [{ categoryID: '33', categoryName: '救生救难用具、消火器类', itemID: '330456', itemName: '电动空气压缩机', itemNameEn: 'Elec.Air Compressor', threshold: 15, quantity: 3, specification: '型号:S.A.S.3.2，类型：橱柜型，电动，电源：直流110V，单相', remark: '主仓库A6/AK-01-02，物资完好存放' }];
  res.json({ totalInventory: inventoryList.length, data: inventoryList });
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
app.post('/claimItem', (req, res) => {
  const { shipID, itemID, quantity, remark, claimer } = req.body;
  console.log(shipID, itemID, quantity, remark, claimer);
  // 这里可以添加申领物资的逻辑
  res.json({ code: 200, message: '申领成功', data: true });
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

// 查看申领历史接口
app.post('/getClaimLog', (req, res) => {
  const { shipID, startTime, endTime } = req.body;
  console.log(shipID, startTime, endTime);
  // 这里可以添加查看申领历史的逻辑
  res.json({ code: 200, data: [{ claimID: '330456', itemID: '330456', itemName: '牙刷', quantity: '20', remark: '申领详情', claimer: '大副', date: '2023-07-15 09:30' }] });
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器正在运行在 http://localhost:${port}`);
}); 