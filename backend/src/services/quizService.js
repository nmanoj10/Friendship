import { normalizeAnswer } from '../utils/normalizeAnswer.js';
import { createError } from '../middleware/errorMiddleware.js';

/**
 * Builds the public shape of a test for quiz takers.
 * ⚠️ Never exposes correctAnswer or dashboardToken.
 */
export function sanitizeTest(test) {
  return {
    testCode: test.testCode,
    creatorName: test.creatorName,
    createdAt: test.createdAt,
    totalQuestions: test.questions.length,
    questions: test.questions
      .map((q) => ({
        questionId: q._id,
        questionText: q.questionText,
        type: q.type,
        isSkippable: q.isSkippable,
        order: q.order,
        options: q.options.map((o) => ({ id: o.id, text: o.text, emoji: o.emoji, imageUrl: o.imageUrl })),
      }))
      .sort((a, b) => a.order - b.order),
  };
}

/**
 * Checks a submitted answer against a question without trusting the client.
 * Returns { isCorrect, points, correctAnswer } — the correct answer is only
 * revealed AFTER the participant has answered (or skipped).
 */
export function checkAnswer(question, submitted) {
  if (question.type === 'mcq') {
    const optionId = submitted?.answer;
    const isCorrect = typeof optionId === 'string' && optionId.length > 0 && optionId === question.correctAnswer;
    const correctOption = question.options.find((o) => o.id === question.correctAnswer);
    return {
      isCorrect,
      points: isCorrect ? 1 : 0,
      correctAnswer: correctOption ? { id: correctOption.id, text: correctOption.text, emoji: correctOption.emoji } : null,
    };
  }
  // Text question — forgiving comparison (trim, lowercase, collapse spaces)
  const isCorrect = normalizeAnswer(submitted?.answer) === normalizeAnswer(question.correctAnswer);
  return {
    isCorrect,
    points: isCorrect ? 1 : 0,
    correctAnswer: { text: String(question.correctAnswer ?? '') },
  };
}

/**
 * Validates and normalizes a test-creation payload.
 * Enforces 1–15 questions and requires a correct answer per question.
 */
export function validateTestPayload(body) {
  const creatorName = typeof body?.creatorName === 'string' ? body.creatorName.trim() : '';
  if (!creatorName) throw createError(400, 'Please enter your name.');
  if (creatorName.length > 50) throw createError(400, 'Name must be 50 characters or fewer.');

  if (!Array.isArray(body?.questions) || body.questions.length < 1 || body.questions.length > 15) {
    throw createError(400, 'A test needs between 1 and 15 questions.');
  }

  const questions = body.questions.map((q, index) => {
    const questionText = typeof q?.questionText === 'string' ? q.questionText.trim() : '';
    if (!questionText) throw createError(400, `Question ${index + 1} is missing text.`);

    const type = q?.type === 'text' ? 'text' : 'mcq';
    const isSkippable = q?.isSkippable !== false;

    if (type === 'mcq') {
      const options = Array.isArray(q?.options)
        ? q.options
            .map((o, i) => ({
              id: typeof o?.id === 'string' && o.id ? o.id : String.fromCharCode(97 + i),
              text: typeof o?.text === 'string' ? o.text.trim() : '',
              emoji: typeof o?.emoji === 'string' ? o.emoji : '',
              imageUrl: typeof o?.imageUrl === 'string' ? o.imageUrl : '',
            }))
            .filter((o) => o.text)
        : [];
      if (options.length < 2) throw createError(400, `Question ${index + 1} needs at least 2 options.`);

      const correctIndex = typeof q?.correctAnswerIndex === 'number' ? q.correctAnswerIndex : -1;
      const correctAnswer = options[correctIndex]?.id;
      if (!correctAnswer) throw createError(400, `Question ${index + 1} needs a correct answer selected.`);

      return { questionText, type, options, correctAnswer, isSkippable, order: index + 1 };
    }

    const correctAnswer = typeof q?.correctAnswer === 'string' ? q.correctAnswer.trim() : '';
    if (!correctAnswer) throw createError(400, `Question ${index + 1} needs an answer.`);
    if (correctAnswer.length > 100) throw createError(400, `Question ${index + 1} answer is too long.`);

    return { questionText, type, options: [], correctAnswer, isSkippable, order: index + 1 };
  });

  return { creatorName, questions };
}
