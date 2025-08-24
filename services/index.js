import { Router } from 'express';
import ping from './ping.js';
import admin from './adminLogin.js';
import login from './login.js';
import getUserInfo from './getUserInfo.js';
import updateUserInfo from './updateUserInfo.js';
import getShipList from './getShipList.js';
import getShipInfo from './getShipInfo.js';
import createInboundBatch from './createInboundBatch.js';
import getInboundList from './getInboundList.js';
import confirmInbound from './confirmInbound.js';
import getInventoryList from './getInventoryList.js';
import claimItem from './claimItem.js';

const router = Router();

// 你后面可以继续在这里挂更多模块
router.use(ping);
router.use(admin);
router.use(login);
router.use(getUserInfo);
router.use(updateUserInfo);
router.use(getShipList);
router.use(getShipInfo);
router.use(createInboundBatch);
router.use(getInboundList);
router.use(confirmInbound);
router.use(getInventoryList);
router.use(claimItem);

export default router;
