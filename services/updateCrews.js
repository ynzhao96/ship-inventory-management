import { Router } from 'express';
import { ok, fail, asyncHandler, q, withTransaction, addLog } from '../utils.js';

const router = Router();

// 更新船员接口（使用 q + withTransaction）
router.post('/updateCrews', asyncHandler(async (req, res) => {
  const { shipId, crews } = req.body ?? {};

  // 基本校验
  if (!shipId) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'Missing shipId' });
  }
  if (!Array.isArray(crews)) {
    return fail(res, 400, { code: 'BAD_REQUEST', message: 'crews 必须是数组' });
  }
  for (let i = 0; i < crews.length; i++) {
    const c = crews[i] ?? {};
    if (!c.name || !c.position) {
      return fail(res, 400, { code: 'BAD_REQUEST', message: `第 ${i + 1} 项缺少 name/position` });
    }
  }

  const list = await withTransaction(async (conn) => {
    // 1) 读取该船当前已有的 id 集合
    const existingRows = await q('SELECT id FROM crews WHERE ship_id = ?', [shipId], conn);
    const existingIds = new Set(existingRows.map(r => Number(r.id)));
    const incomingIds = new Set(
      crews.filter(c => c.id != null).map(c => Number(c.id))
    );

    // 2) 删除：现有但未提交的 id
    const toDelete = [...existingIds].filter(id => !incomingIds.has(id));
    if (toDelete.length > 0) {
      const inPH = toDelete.map(() => '?').join(', ');
      await q(
        `DELETE FROM crews WHERE ship_id = ? AND id IN (${inPH})`,
        [shipId, ...toDelete],
        conn
      );
    }

    // 3) 更新/插入
    for (const c of crews) {
      const name = String(c.name ?? '').trim();
      const position = String(c.position ?? '').trim();

      if (c.id != null) {
        await q(
          'UPDATE crews SET name = ?, position = ? WHERE id = ? AND ship_id = ?',
          [name, position, Number(c.id), shipId],
          conn
        );
      } else {
        await q(
          'INSERT INTO crews (ship_id, name, position) VALUES (?, ?, ?)',
          [shipId, name, position],
          conn
        );
      }
    }

    // 4) 回读最新列表（含新生成的 id）
    const list = await q(
      'SELECT id, name, position FROM crews WHERE ship_id = ? ORDER BY id ASC',
      [shipId],
      conn
    );

    return list;
  });

  return ok(res, { data: list }, { message: '保存成功' });
}));

export default router;
