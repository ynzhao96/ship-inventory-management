import express from 'express';
import pool from './db';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// 登录接口
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, password FROM users WHERE username = ? LIMIT 1',
      [username]
    );
    console.log(rows);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = rows[0];

    // 简单对比密码（生产环境必须用 bcrypt 哈希）
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    return res.json({ message: 'Login successful', userId: user.id });
  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).json({ error: 'Database error' });
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
  const lowInventoryWarnings = [{ itemID: '330456', itemName: '电动空气压缩机', threshold: 15, amount: 3 }];
  res.json({ data: lowInventoryWarnings });
});

// 获取全部库存接口
app.post('/getInventoryList', (req, res) => {
  const { shipID } = req.body;
  console.log(shipID);
  // 假设我们有一个库存信息列表
  const inventoryList = [{ categoryID: '33', categoryName: '救生救难用具、消火器类', itemID: '330456', itemName: '电动空气压缩机', itemNameEn: 'Elec.Air Compressor', threshold: 15, amount: 3, specification: '型号:S.A.S.3.2，类型：橱柜型，电动，电源：直流110V，单相', remark: '主仓库A6/AK-01-02，物资完好存放' }];
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
  res.json({ code: 200, data: [{ confirmID: '33045ssx6', itemID: '330456', itemName: '电动空气压缩机', amount: '20', remark: '确认入库备注信息', batchNumber: 'LOT-20230615-001', submitDate: '2023-07-15 09:30', confirmDate: '2023-08-15 09:30' }] });
});

// 申领物资接口
app.post('/claimItem', (req, res) => {
  const { shipID, itemID, amount, remark, claimer } = req.body;
  console.log(shipID, itemID, amount, remark, claimer);
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

// 获取申领人列表接口
app.post('/getClaimerList', (req, res) => {
  const { shipID } = req.body;
  console.log(shipID);
  // 这里可以添加获取申领人列表的逻辑
  res.json({ code: 200, data: [{ position: '船长', name: '张三' }] });
});

// 查看申领历史接口
app.post('/getClaimLog', (req, res) => {
  const { shipID, startTime, endTime } = req.body;
  console.log(shipID, startTime, endTime);
  // 这里可以添加查看申领历史的逻辑
  res.json({ code: 200, data: [{ claimID: '330456', itemID: '330456', itemName: '牙刷', amount: '20', remark: '申领详情', claimer: '大副', date: '2023-07-15 09:30' }] });
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器正在运行在 http://localhost:${port}`);
}); 