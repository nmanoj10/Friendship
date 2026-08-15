import { Test } from '../models/Test.js';
import { Attempt } from '../models/Attempt.js';
import { generateCode } from '../utils/generateCode.js';
import { sanitizeTest, validateTestPayload } from '../services/quizService.js';
import { asyncHandler, createError } from '../middleware/errorMiddleware.js';

export const createTest = asyncHandler(async (req, res) => {
  const { creatorName, questions } = validateTestPayload(req.body);

  const test = await Test.create({
    userId: req.userId,
    creatorName,
    questions,
    testCode: generateCode(6),
    dashboardToken: generateCode(16),
  });

  res.status(201).json({
    testCode: test.testCode,
    dashboardToken: test.dashboardToken,
    creatorName: test.creatorName,
    totalQuestions: test.questions.length,
  });
});

export const getPublicTest = asyncHandler(async (req, res) => {
  const test = await Test.findOne({ testCode: req.params.testCode });
  if (!test) throw createError(404, '😕 Test not found');
  res.json(sanitizeTest(test));
});

export const getMyTests = asyncHandler(async (req, res) => {
  const tests = await Test.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();

  const counts = await Attempt.aggregate([
    { $match: { testId: { $in: tests.map((t) => t._id) } } },
    { $group: { _id: '$testId', attempts: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.attempts]));

  res.json({
    tests: tests.map((t) => ({
      testCode: t.testCode,
      dashboardToken: t.dashboardToken,
      creatorName: t.creatorName,
      totalQuestions: t.questions.length,
      createdAt: t.createdAt,
      attempts: countMap.get(String(t._id)) ?? 0,
    })),
  });
});

export const claimTest = asyncHandler(async (req, res) => {
  const dashboardToken =
    typeof req.body?.dashboardToken === 'string' ? req.body.dashboardToken.trim() : '';
  if (!dashboardToken) throw createError(400, 'Enter the dashboard token from your test link.');

  const test = await Test.findOne({ dashboardToken });
  if (!test) throw createError(404, 'No test found with that dashboard token.');

  const alreadyMine = test.userId && String(test.userId) === String(req.userId);
  if (test.userId && !alreadyMine) {
    throw createError(409, 'This test already belongs to another account.');
  }

  if (!test.userId) {
    test.userId = req.userId;
    await test.save();
  }

  res.json({
    testCode: test.testCode,
    dashboardToken: test.dashboardToken,
    creatorName: test.creatorName,
    totalQuestions: test.questions.length,
    claimed: true,
  });
});
