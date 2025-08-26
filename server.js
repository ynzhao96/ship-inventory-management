import express from 'express';
import services from './services/index.js';

const app = express();
const port = 3000;

app.use(express.json());

app.use('/', services);

// 启动服务器
app.listen(port, () => {
  console.log(`服务器正在运行在 http://localhost:${port}`);
}); 