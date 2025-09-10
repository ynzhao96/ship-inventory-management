import express from 'express';
import cors from 'cors';
import services from './services/index.js';

const app = express();
const port = 3000;

// 如果要带 cookie 或 Authorization，并允许多个子域：
const allowlist = [
  'https://yzkerun.cn',
  'https://www.yzkerun.cn',
  'https://admin.yzkerun.cn',
  'https://ship.yzkerun.cn',
  'http://localhost:5173'
];

// app.use(cors({
//   origin(origin, cb) {
//     // 允许无 Origin（如服务器到服务器）或在白名单中的 Origin
//     if (!origin || allowlist.includes(origin)) return cb(null, true);
//     return cb(new Error('Not allowed by CORS'));
//   },
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'x-token', 'x_auth_token'],
//   credentials: true,               // 若需要发送 cookie/凭证
// }));

app.use(express.json());

app.use('/', services);

// 启动服务器
app.listen(port, () => {
  console.log(`服务器正在运行在 http://localhost:${port}`);
});
