import { Test } from '../models/Test.js';
import { Attempt } from '../models/Attempt.js';
import {
  buildLeaderboard,
  buildQuestionAnalytics,
  buildScoreDistribution,
  computeDashboardStats,
} from '../services/scoreService.js';
import { asyncHandler, createError } from '../middleware/errorMiddleware.js';

async function findTestByToken(token) {
  const test = await Test.findOne({ dashboardToken: token });
  if (!test) throw createError(404, 'Dashboard not found. Check your dashboard link.');
  return test;
}

export const getDashboard = asyncHandler(async (req, res) => {
  const test = await findTestByToken(req.params.dashboardToken);
  const attempts = await Attempt.find({ testId: test._id }).sort({ createdAt: -1 });

  const completed = attempts.filter((a) => a.status === 'completed');

  res.json({
    test: {
      testCode: test.testCode,
      creatorName: test.creatorName,
      totalQuestions: test.questions.length,
      createdAt: test.createdAt,
    },
    stats: computeDashboardStats(attempts, test.questions.length),
    leaderboard: buildLeaderboard(attempts).slice(0, 20),
    recentAttempts: completed.slice(0, 10).map((a) => ({
      attemptId: a._id,
      participantName: a.participantName,
      score: a.score,
      totalQuestions: a.totalQuestions,
      percentage: a.totalQuestions ? Math.round((a.score / a.totalQuestions) * 100) : 0,
      completedAt: a.completedAt,
    })),
    questionAnalytics: buildQuestionAnalytics(test, attempts),
    scoreDistribution: buildScoreDistribution(attempts, test.questions.length),
  });
});

export const getAttemptDetail = asyncHandler(async (req, res) => {
  const test = await findTestByToken(req.params.dashboardToken);
  const attempt = await Attempt.findOne({ _id: req.params.attemptId, testId: test._id });
  if (!attempt) throw createError(404, 'Attempt not found');

  const breakdown = test.questions.map((q) => {
    const entry = attempt.answers.find((a) => String(a.questionId) === String(q._id));
    return {
      questionId: q._id,
      questionText: q.questionText,
      type: q.type,
      answer: entry?.answer ?? null,
      answerText:
        entry && !entry.skipped
          ? q.type === 'mcq'
            ? q.options.find((o) => o.id === entry.answer)?.text ?? null
            : typeof entry.answer === 'string'
              ? entry.answer
              : null
          : null,
      correctAnswer: entry?.correctAnswer ?? null,
      skipped: !!entry?.skipped,
      isCorrect: !!entry?.isCorrect,
      points: entry?.points ?? 0,
    };
  });

  res.json({
    attemptId: attempt._id,
    participantName: attempt.participantName,
    status: attempt.status,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    correctAnswers: attempt.correctAnswers,
    wrongAnswers: attempt.wrongAnswers,
    skippedAnswers: attempt.skippedAnswers,
    completedAt: attempt.completedAt,
    breakdown,
  });
});
