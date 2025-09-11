import { Router } from 'express';
import { ok, fail, asyncHandler, requireFields, q, addLog } from '../utils.js';
import { authRequired } from '../auth.js';

const router = Router();
router.use(authRequired);

// 获取船舶列表
router.get('/getShipList', asyncHandler(async (_req, res) => {
  const sql = `
  SELECT 
    s.*,
    COALESCE(inv.totalQuantity, 0)   AS inventoryQuantity,
    COALESCE(ibd.pendingCount, 0)    AS pendingInbounds
  FROM ships AS s
  LEFT JOIN (
    SELECT 
        ship_id,
        COUNT(*) AS totalQuantity
    FROM inventory
    GROUP BY ship_id
  ) AS inv
    ON s.id = inv.ship_id
  LEFT JOIN (
    SELECT 
        ship_id,
        COUNT(*) AS pendingCount
    FROM inbounds
    WHERE status = 'PENDING'
    GROUP BY ship_id
  ) AS ibd
    ON s.id = ibd.ship_id
  ORDER BY s.id;
`
  const rows = await q(sql);
  return ok(res, {
    totalShips: rows.length,
    data: rows,
  }, { message: '获取船舶列表成功' });
}));

export default router;
