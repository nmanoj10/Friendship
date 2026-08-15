import { Router } from 'express';
import { getAttemptDetail, getDashboard } from '../controllers/dashboardController.js';

const router = Router();

router.get('/:dashboardToken', getDashboard);
router.get('/:dashboardToken/attempts/:attemptId', getAttemptDetail);

export default router;
