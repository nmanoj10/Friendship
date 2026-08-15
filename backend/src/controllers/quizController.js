import { Test } from '../models/Test.js';
import { Attempt } from '../models/Attempt.js';
import { checkAnswer } from '../services/quizService.js';
import { computeScore, getFriendshipLevel } from '../services/scoreService.js';
import { asyncHandler, createError } from '../middleware/errorMiddleware.js';

async function findTest(code) {
  const test = await Test.findOne({ testCode: code });
  if (!test) throw createError(404, '😕 Test not found');
  return test;
}

async function findAttempt(attemptId, test) {
  if (!attemptId) throw createError(400, 'Missing attempt id');
  const attempt = await Attempt.findOne({ _id: attemptId, testId: test._id });
  if (!attempt) throw createError(404, 'Attempt not found');
  return attempt;
}

function toAnswerEntry(question, { answer, skipped, isCorrect, points }) {
  return {
    questionId: question._id,
    answer: skipped ? null : answer,
    skipped: !!skipped,
    isCorrect,
    points,
    correctAnswer: skipped ? null : checkAnswer(question, { answer }).correctAnswer,
  };
}

function answerDisplayText(question, entry) {
  if (!entry || entry.skipped) return null;
  if (question.type === 'mcq') {
    return question.options.find((o) => o.id === entry.answer)?.text ?? null;
  }
  return typeof entry.answer === 'string' ? entry.answer : null;
}

export const startAttempt = asyncHandler(async (req, res) => {
  const test = await findTest(req.params.testCode);
  const participantName =
    typeof req.body?.participantName === 'string' ? req.body.participantName.trim() : '';
  if (!participantName) throw createError(400, 'Please enter your name.');
  if (participantName.length > 50) throw createError(400, 'Name must be 50 characters or fewer.');

  const attempt = await Attempt.create({
    testId: test._id,
    participantName,
    totalQuestions: test.questions.length,
  });

  res.status(201).json({
    attemptId: attempt._id,
    participantName: attempt.participantName,
    totalQuestions: test.questions.length,
  });
});

export const submitAnswer = asyncHandler(async (req, res) => {
  const test = await findTest(req.params.testCode);
  const attempt = await findAttempt(req.params.attemptId, test);
  if (attempt.status === 'completed') throw createError(409, 'This test is already completed.');

  const { questionId, answer, skipped } = req.body ?? {};
  const question = test.questions.find((q) => String(q._id) === String(questionId));
  if (!question) throw createError(400, 'Unknown question.');

  // Idempotent: if this question was already answered (e.g. page refresh), return the stored result.
  const existing = attempt.answers.find((a) => String(a.questionId) === String(questionId));
  if (existing) {
    return res.json({
      questionId: question._id,
      questionText: question.questionText,
      skipped: existing.skipped,
      isCorrect: existing.isCorrect,
      points: existing.points,
      answer: existing.answer,
      correctAnswer: existing.correctAnswer,
      alreadyAnswered: true,
    });
  }

  let entry;
  if (skipped) {
    entry = toAnswerEntry(question, { answer: null, skipped: true, isCorrect: false, points: 0 });
  } else if (question.type === 'mcq') {
    if (typeof answer !== 'string' || !answer) throw createError(400, 'Please pick an option.');
    const result = checkAnswer(question, { answer });
    entry = toAnswerEntry(question, { answer, skipped: false, ...result });
  } else {
    if (typeof answer !== 'string' || !answer.trim()) throw createError(400, 'Please enter an answer.');
    const result = checkAnswer(question, { answer });
    entry = toAnswerEntry(question, { answer, skipped: false, ...result });
  }

  attempt.answers.push(entry);
  const totals = computeScore(attempt.answers);
  attempt.score = totals.score;
  attempt.correctAnswers = totals.correctAnswers;
  attempt.wrongAnswers = totals.wrongAnswers;
  attempt.skippedAnswers = totals.skippedAnswers;
  await attempt.save();

  res.json({
    questionId: question._id,
    questionText: question.questionText,
    skipped: entry.skipped,
    isCorrect: entry.isCorrect,
    points: entry.points,
    answer: entry.answer,
    correctAnswer: entry.correctAnswer,
  });
});

export const completeAttempt = asyncHandler(async (req, res) => {
  const test = await findTest(req.params.testCode);
  const attempt = await findAttempt(req.params.attemptId, test);

  const totals = computeScore(attempt.answers);
  attempt.score = totals.score;
  attempt.correctAnswers = totals.correctAnswers;
  attempt.wrongAnswers = totals.wrongAnswers;
  attempt.skippedAnswers = totals.skippedAnswers;
  attempt.status = 'completed';
  attempt.completedAt = new Date();
  await attempt.save();

  const total = test.questions.length;
  const breakdown = test.questions.map((q) => {
    const entry = attempt.answers.find((a) => String(a.questionId) === String(q._id));
    return {
      questionId: q._id,
      questionText: q.questionText,
      type: q.type,
      answer: entry?.answer ?? null,
      answerText: answerDisplayText(q, entry),
      correctAnswer: entry?.correctAnswer ?? null,
      skipped: !!entry?.skipped,
      isCorrect: !!entry?.isCorrect,
      points: entry?.points ?? 0,
    };
  });

  res.json({
    attemptId: attempt._id,
    participantName: attempt.participantName,
    creatorName: test.creatorName,
    score: attempt.score,
    totalQuestions: total,
    percentage: total ? Math.round((attempt.score / total) * 100) : 0,
    correctAnswers: attempt.correctAnswers,
    wrongAnswers: attempt.wrongAnswers,
    skippedAnswers: attempt.skippedAnswers,
    friendshipLevel: getFriendshipLevel(attempt.score, total),
    breakdown,
    completedAt: attempt.completedAt,
  });
});
