import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB, disconnectDB } from '../../src/config/db.js';
import app from '../../src/app.js';

let mongod;
let server;
let baseUrl;

before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('friendship_test');
  await connectDB();
  server = app.listen(0);
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server?.close();
  await disconnectDB();
  await mongod?.stop();
});

async function api(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

const validTestPayload = {
  creatorName: 'Manoj',
  questions: [
    {
      questionText: 'What is my favorite food?',
      type: 'mcq',
      options: [
        { id: 'a', text: 'Pizza', emoji: '🍕' },
        { id: 'b', text: 'Biryani', emoji: '🍛' },
        { id: 'c', text: 'Idli', emoji: '🥘' },
        { id: 'd', text: 'Burger', emoji: '🍔' },
      ],
      correctAnswerIndex: 1,
    },
    { questionText: 'Who is my first crush?', type: 'text', correctAnswer: 'Manoj' },
  ],
};

async function registerUser(username = 'manoj') {
  const res = await api('/api/auth/register', {
    method: 'POST',
    body: { username, password: 'secret123' },
  });
  assert.equal(res.status, 201);
  return res.data.token;
}

test('auth: register, login, me, duplicate and bad credentials', async () => {
  // Register a fresh user
  const reg = await api('/api/auth/register', {
    method: 'POST',
    body: { username: '  Rahul  ', password: 'secret123' },
  });
  assert.equal(reg.status, 201);
  assert.equal(reg.data.user.username, 'rahul'); // trimmed + lowercased
  assert.ok(reg.data.token);

  // me with a valid token
  const me = await api('/api/auth/me', { token: reg.data.token });
  assert.equal(me.status, 200);
  assert.equal(me.data.user.username, 'rahul');

  // me with an invalid token → 401
  const badMe = await api('/api/auth/me', { token: 'not-a-real-token' });
  assert.equal(badMe.status, 401);

  // Duplicate username → 409
  const dup = await api('/api/auth/register', {
    method: 'POST',
    body: { username: 'rahul', password: 'other123' },
  });
  assert.equal(dup.status, 409);

  // Wrong password → 401
  const badLogin = await api('/api/auth/login', {
    method: 'POST',
    body: { username: 'rahul', password: 'nope' },
  });
  assert.equal(badLogin.status, 401);

  // Correct login → 200 with a token
  const goodLogin = await api('/api/auth/login', {
    method: 'POST',
    body: { username: 'rahul', password: 'secret123' },
  });
  assert.equal(goodLogin.status, 200);
  assert.equal(goodLogin.data.user.username, 'rahul');
  assert.ok(goodLogin.data.token);

  // Validation: short password and bad username
  const shortPw = await api('/api/auth/register', {
    method: 'POST',
    body: { username: 'newbie', password: '123' },
  });
  assert.equal(shortPw.status, 400);
  const badName = await api('/api/auth/register', {
    method: 'POST',
    body: { username: 'has space!', password: 'secret123' },
  });
  assert.equal(badName.status, 400);
});

test('tests are owner-scoped: my tests list, claim by token, and 401 without login', async () => {
  const token = await registerUser('priya');

  // Creating a test without a token → 401
  const anon = await api('/api/tests', { method: 'POST', body: validTestPayload });
  assert.equal(anon.status, 401);

  // Owner creates a test
  const created = await api('/api/tests', {
    method: 'POST',
    body: validTestPayload,
    token,
  });
  assert.equal(created.status, 201);
  const { testCode, dashboardToken } = created.data;

  // My tests lists exactly this one, with its dashboard token (owner-only)
  const mine = await api('/api/tests', { token });
  assert.equal(mine.status, 200);
  assert.equal(mine.data.tests.length, 1);
  assert.equal(mine.data.tests[0].testCode, testCode);
  assert.equal(mine.data.tests[0].dashboardToken, dashboardToken);
  assert.equal(mine.data.tests[0].attempts, 0);

  // A different user cannot see it
  const otherToken = await registerUser('akash');
  const theirs = await api('/api/tests', { token: otherToken });
  assert.equal(theirs.data.tests.length, 0);

  // Claiming a test that already belongs to someone else → 409
  const foreignClaim = await api('/api/tests/claim', {
    method: 'POST',
    body: { dashboardToken },
    token: otherToken,
  });
  assert.equal(foreignClaim.status, 409);

  // The owner can claim it again (idempotent)
  const reClaim = await api('/api/tests/claim', {
    method: 'POST',
    body: { dashboardToken },
    token,
  });
  assert.equal(reClaim.status, 200);
  assert.equal(reClaim.data.testCode, testCode);

  // A legacy test (no userId) can be claimed by a new account
  const legacy = await api('/api/tests/claim', {
    method: 'POST',
    body: { dashboardToken: 'legacy-token-does-not-exist' },
    token: otherToken,
  });
  assert.equal(legacy.status, 404);
});

test('full flow: create test → quiz → complete → dashboard', async () => {
  const token = await registerUser('fullflow');
  const created = await api('/api/tests', {
    method: 'POST',
    body: validTestPayload,
    token,
  });
  assert.equal(created.status, 201);
  assert.equal(created.data.totalQuestions, 2);
  const { testCode, dashboardToken } = created.data;

  // 2. Public test must NOT leak correct answers
  const pub = await api(`/api/tests/${testCode}`);
  assert.equal(pub.status, 200);
  assert.equal(pub.data.creatorName, 'Manoj');
  assert.equal(pub.data.questions.length, 2);
  assert.equal(pub.data.questions[0].correctAnswer, undefined);
  assert.equal(pub.data.dashboardToken, undefined);

  // 3. Start an attempt
  const start = await api(`/api/tests/${testCode}/attempts`, {
    method: 'POST',
    body: { participantName: '  Rahul ' },
  });
  assert.equal(start.status, 201);
  assert.equal(start.data.participantName, 'Rahul');
  const attemptId = start.data.attemptId;

  // 4. Answer Q1 correctly (mcq)
  const q1 = pub.data.questions[0];
  const ok = await api(`/api/tests/${testCode}/attempts/${attemptId}/answer`, {
    method: 'POST',
    body: { questionId: q1.questionId, answer: 'b' },
  });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.isCorrect, true);
  assert.equal(ok.data.points, 1);

  // 5. Answer Q2 wrong
  const q2 = pub.data.questions[1];
  const wrong = await api(`/api/tests/${testCode}/attempts/${attemptId}/answer`, {
    method: 'POST',
    body: { questionId: q2.questionId, answer: 'Priya' },
  });
  assert.equal(wrong.data.isCorrect, false);
  assert.equal(wrong.data.correctAnswer.text, 'Manoj');

  // 6. Duplicate submission is idempotent
  const dup = await api(`/api/tests/${testCode}/attempts/${attemptId}/answer`, {
    method: 'POST',
    body: { questionId: q1.questionId, answer: 'a' },
  });
  assert.equal(dup.data.alreadyAnswered, true);
  assert.equal(dup.data.isCorrect, true);

  // 7. Complete the attempt
  const done = await api(`/api/tests/${testCode}/attempts/${attemptId}/complete`, { method: 'POST' });
  assert.equal(done.status, 200);
  assert.equal(done.data.score, 1);
  assert.equal(done.data.totalQuestions, 2);
  assert.equal(done.data.percentage, 50);
  assert.equal(done.data.correctAnswers, 1);
  assert.equal(done.data.wrongAnswers, 1);
  assert.equal(done.data.friendshipLevel.label, 'Casual Friend');

  // 8. Another participant, all correct
  const start2 = await api(`/api/tests/${testCode}/attempts`, {
    method: 'POST',
    body: { participantName: 'Akash' },
  });
  const attempt2 = start2.data.attemptId;
  for (const q of pub.data.questions) {
    const answer = q.type === 'mcq' ? 'b' : 'manoj';
    await api(`/api/tests/${testCode}/attempts/${attempt2}/answer`, {
      method: 'POST',
      body: { questionId: q.questionId, answer },
    });
  }
  const done2 = await api(`/api/tests/${testCode}/attempts/${attempt2}/complete`, { method: 'POST' });
  assert.equal(done2.data.score, 2);

  // 9. Dashboard aggregates everything
  const dash = await api(`/api/dashboard/${dashboardToken}`);
  assert.equal(dash.status, 200);
  assert.equal(dash.data.test.creatorName, 'Manoj');
  assert.equal(dash.data.stats.totalAttempts, 2);
  assert.equal(dash.data.stats.highestScore, 2);
  assert.equal(dash.data.stats.lowestScore, 1);
  assert.equal(dash.data.leaderboard[0].participantName, 'Akash');
  assert.equal(dash.data.leaderboard[0].rank, 1);
  assert.equal(dash.data.questionAnalytics.length, 2);
  assert.equal(dash.data.questionAnalytics[0].correct, 2);

  // 10. Individual attempt detail shows correct answers for wrong ones
  const detail = await api(`/api/dashboard/${dashboardToken}/attempts/${attemptId}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.data.participantName, 'Rahul');
  const q2detail = detail.data.breakdown.find((b) => b.questionId === String(q2.questionId));
  assert.equal(q2detail.isCorrect, false);
  assert.equal(q2detail.correctAnswer.text, 'Manoj');

  // 11. Wrong dashboard token → 404
  const bad = await api('/api/dashboard/nope');
  assert.equal(bad.status, 404);

  // 12. Completed attempts reject further answers
  const late = await api(`/api/tests/${testCode}/attempts/${attemptId}/answer`, {
    method: 'POST',
    body: { questionId: q1.questionId, answer: 'a' },
  });
  assert.equal(late.status, 409);

  // 13. Attempts now show up in the owner's my-tests count
  const mine = await api('/api/tests', { token });
  assert.equal(mine.data.tests[0].attempts, 2);
});

test('validation: empty names and bad payloads are rejected', async () => {
  const token = await registerUser('validator');

  const noName = await api('/api/tests', {
    method: 'POST',
    body: { creatorName: '   ', questions: [] },
    token,
  });
  assert.equal(noName.status, 400);

  const tooMany = await api('/api/tests', {
    method: 'POST',
    body: {
      creatorName: 'X',
      questions: Array.from({ length: 16 }, (_, i) => ({
        questionText: `Q${i}`,
        type: 'text',
        correctAnswer: 'a',
      })),
    },
    token,
  });
  assert.equal(tooMany.status, 400);

  // Empty participant name against a real test → 400
  const made = await api('/api/tests', {
    method: 'POST',
    body: { creatorName: 'M', questions: [{ questionText: 'Q', type: 'text', correctAnswer: 'a' }] },
    token,
  });
  const startNoName = await api(`/api/tests/${made.data.testCode}/attempts`, {
    method: 'POST',
    body: { participantName: '   ' },
  });
  assert.equal(startNoName.status, 400);

  // Unknown test code → 404
  const unknown = await api('/api/tests/DOESNOTEXIST');
  assert.equal(unknown.status, 404);
});
