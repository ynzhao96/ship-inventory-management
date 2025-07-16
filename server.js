import express from 'express';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// 登录接口
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // 假设我们有一个用户列表进行验证
  const users = [{ username: 'user1', password: '123456', shipID: '1233332' }];
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ code: 200, message: '登录成功', data: { shipID: user.shipID, token: 'xxxxxxxxxxxxxxxxxxxxxx' } });
  } else {
    res.status(401).json({ code: 401, message: '用户名或密码错误' });
  }
});

// 获取首页信息接口
app.post('/api/getHomeInfo', (req, res) => {
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
app.post('/api/getLowInventory', (req, res) => {
  const { shipID } = req.body;
  console.log(shipID);
  // 假设我们有一个低库存预警信息列表
  const lowInventoryWarnings = [{ itemID: '330456', itemName: '电动空气压缩机', threshold: 15, amount: 3 }];
  res.json({ data: lowInventoryWarnings });
});

// 获取全部库存接口
app.post('/api/getInventoryList', (req, res) => {
  const { shipID } = req.body;
  console.log(shipID);
  // 假设我们有一个库存信息列表
  const inventoryList = [{ categoryID: '33', categoryName: '救生救难用具、消火器类', itemID: '330456', itemName: '电动空气压缩机', itemNameEn: 'Elec.Air Compressor', threshold: 15, amount: 3, specification: '型号:S.A.S.3.2，类型：橱柜型，电动，电源：直流110V，单相', remark: '主仓库A6/AK-01-02，物资完好存放' }];
  res.json({ totalInventory: inventoryList.length, data: inventoryList });
});

// 撤销入库接口
app.post('/api/cancelConfirm', (req, res) => {
  const { shipID, confirmID, remark } = req.body;
  console.log(shipID, confirmID, remark);
  // 这里可以添加撤销入库的逻辑
  res.json({ code: 200, message: '撤销入库成功', data: true });
});

// 查看入库历史接口
app.post('/api/getConfirmLog', (req, res) => {
  const { shipID, startTime, endTime } = req.body;
  console.log(shipID, startTime, endTime);
  // 这里可以添加查看入库历史的逻辑
  res.json({ code: 200, data: [{ confirmID: '33045ssx6', itemID: '330456', itemName: '电动空气压缩机', amount: '20', remark: '确认入库备注信息', batchNumber: 'LOT-20230615-001', submitDate: '2023-07-15 09:30', confirmDate: '2023-08-15 09:30' }] });
});

// 申领物资接口
app.post('/api/claimItem', (req, res) => {
  const { shipID, itemID, amount, remark, claimer } = req.body;
  console.log(shipID, itemID, amount, remark, claimer);
  // 这里可以添加申领物资的逻辑
  res.json({ code: 200, message: '申领成功', data: true });
});

// 撤销申领接口
app.post('/api/cancelClaim', (req, res) => {
  const { shipID, claimID, remark } = req.body;
  console.log(shipID, claimID, remark);
  // 这里可以添加撤销申领的逻辑
  res.json({ code: 200, message: '撤销申领成功', data: true });
});

// 获取申领人列表接口
app.post('/api/getClaimerList', (req, res) => {
  const { shipID } = req.body;
  console.log(shipID);
  // 这里可以添加获取申领人列表的逻辑
  res.json({ code: 200, data: [{ position: '船长', name: '张三' }] });
});

// 查看申领历史接口
app.post('/api/getClaimLog', (req, res) => {
  const { shipID, startTime, endTime } = req.body;
  console.log(shipID, startTime, endTime);
  // 这里可以添加查看申领历史的逻辑
  res.json({ code: 200, data: [{ claimID: '330456', itemID: '330456', itemName: '牙刷', amount: '20', remark: '申领详情', claimer: '大副', date: '2023-07-15 09:30' }] });
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器正在运行在 http://localhost:${port}`);
}); 