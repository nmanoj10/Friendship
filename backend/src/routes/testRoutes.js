import { Router } from 'express';
import { createTest, getPublicTest, getMyTests, claimTest } from '../controllers/testController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', protect, createTest);
router.get('/', protect, getMyTests);
router.post('/claim', protect, claimTest);
router.get('/:testCode', getPublicTest);

export default router;
