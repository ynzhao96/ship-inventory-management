import { Router } from 'express';
import pingRouter from './ping.js';
import adminRouter from './adminLogin.js';

const router = Router();

// 你后面可以继续在这里挂更多模块
router.use(pingRouter);
router.use(adminRouter);

export default router;
