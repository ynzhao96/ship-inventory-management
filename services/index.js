import { Router } from 'express';
import pingRouter from './ping.js';

const router = Router();

// 你后面可以继续在这里挂更多模块
router.use(pingRouter);

export default router;
