import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkAnswer, sanitizeTest } from '../../src/services/quizService.js';

const mcqQuestion = {
  _id: 'q1',
  questionText: 'What is my favorite food?',
  type: 'mcq',
  correctAnswer: 'b',
  options: [
    { id: 'a', text: 'Pizza', emoji: '🍕' },
    { id: 'b', text: 'Biryani', emoji: '🍛' },
    { id: 'c', text: 'Idli', emoji: '🥘' },
    { id: 'd', text: 'Burger', emoji: '🍔' },
  ],
};

const textQuestion = {
  _id: 'q2',
  questionText: "What is my first crush's name?",
  type: 'text',
  correctAnswer: 'Manoj',
  options: [],
};

test('mcq: correct option scores a point', () => {
  const r = checkAnswer(mcqQuestion, { answer: 'b' });
  assert.equal(r.isCorrect, true);
  assert.equal(r.points, 1);
  assert.equal(r.correctAnswer.text, 'Biryani');
});

test('mcq: wrong option scores zero and reveals the correct answer', () => {
  const r = checkAnswer(mcqQuestion, { answer: 'a' });
  assert.equal(r.isCorrect, false);
  assert.equal(r.points, 0);
  assert.equal(r.correctAnswer.text, 'Biryani');
});

test('text: answer is compared case-insensitively with whitespace trimmed', () => {
  assert.equal(checkAnswer(textQuestion, { answer: '  manoj ' }).isCorrect, true);
  assert.equal(checkAnswer(textQuestion, { answer: 'MANOJ' }).isCorrect, true);
  assert.equal(checkAnswer(textQuestion, { answer: 'Rahul' }).isCorrect, false);
});

test('sanitizeTest never leaks correctAnswer or dashboardToken', () => {
  const test = {
    testCode: 'ABC123',
    dashboardToken: 'super-secret-token',
    creatorName: 'Manoj',
    createdAt: new Date(),
    questions: [mcqQuestion],
  };
  const safe = sanitizeTest(test);
  assert.equal(safe.testCode, 'ABC123');
  assert.equal(safe.creatorName, 'Manoj');
  assert.equal(safe.dashboardToken, undefined);
  assert.equal(safe.questions[0].correctAnswer, undefined);
  assert.deepEqual(
    safe.questions[0].options.map((o) => o.id),
    ['a', 'b', 'c', 'd']
  );
});
