import express from 'express';
import { seedDummyData } from '../utils/seedDummyData';

const router = express.Router();

router.post('/seed/:size', async (req, res) => {
  try {
    const size: number = parseInt(req.params.size, 10) || 10;
    const result = await seedDummyData(size);

    res.json({ message: `Seeded ${result.length} mods.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
