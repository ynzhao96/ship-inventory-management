import { Router } from 'express';

const router = Router();

// ping
router.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

export default router;
