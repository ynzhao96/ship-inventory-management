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