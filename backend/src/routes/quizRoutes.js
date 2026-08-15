import { Router } from 'express';
import { completeAttempt, startAttempt, submitAnswer } from '../controllers/quizController.js';

const router = Router();

router.post('/:testCode/attempts', startAttempt);
router.post('/:testCode/attempts/:attemptId/answer', submitAnswer);
router.post('/:testCode/attempts/:attemptId/complete', completeAttempt);

export default router;
