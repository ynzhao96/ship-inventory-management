import { Router } from 'express';
import ping from './ping.js';
import admin from './adminLogin.js';
import login from './login.js';
import getUserInfo from './getUserInfo.js';

const router = Router();

// 你后面可以继续在这里挂更多模块
router.use(ping);
router.use(admin);
router.use(login);
router.use(getUserInfo);

export default router;
