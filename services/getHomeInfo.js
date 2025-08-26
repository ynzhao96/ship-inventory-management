import { Router } from 'express';
import { ok, fail, asyncHandler, q, addLog, withTransaction, requireFields } from '../utils.js';

const router = Router();

// 获取首页信息
router.get('/getHomeInfo', asyncHandler(async (req, res) => {
  const { shipId } = req.query ?? {};

  const check = requireFields(req.query, ['shipId']);
  if (!check.ok) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'shipId必填' });
  }

  try {
    const shipName = (await q(`SELECT name AS shipName, type AS shipType FROM ships WHERE id = ? `, [shipId]))?.[0]?.shipName;
    const userName = (await q(`SELECT username AS userName FROM users WHERE ship_id = ?`, [shipId]))?.[0]?.userName;
    const totalInventory = (await q(`SELECT COUNT(1) AS totalInventory FROM inventory WHERE ship_id = ?`, [shipId]))?.[0]?.totalInventory;
    const totalInbound = (await q(`SELECT COUNT(1) AS totalInbound FROM inbounds WHERE status = 'PENDING' AND ship_id = ?`, [shipId]))?.[0]?.totalInbound;
    const totalWarning = (await q(`SELECT COUNT(1) AS totalWarning FROM inventory WHERE ship_id = ? AND threshold IS NOT NULL AND threshold < quantity`, [shipId]))?.[0]?.totalWarning;

    return ok(res, {
      data: {
        userName: userName ?? '',
        shipInfo: {
          shipId: shipId,
          shipName: shipName ?? ''
        },
        totalInventory: totalInventory ?? 0,
        totalInbound: totalInbound ?? 0,
        totalWarning: totalWarning ?? 0
      }
    }, { message: '查询首页信息成功' });
  } catch (err) {
    return fail(res, 500, { code: err?.code || 'DB_ERROR', message: err?.sqlMessage || '数据库错误' });
  }
}));

export default router;
