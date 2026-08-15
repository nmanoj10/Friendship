import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLeaderboard,
  computeDashboardStats,
  computeScore,
  getFriendshipLevel,
} from '../../src/services/scoreService.js';

test('computeScore tallies correct / wrong / skipped', () => {
  const answers = [
    { points: 1, isCorrect: true, skipped: false },
    { points: 0, isCorrect: false, skipped: false },
    { points: 0, isCorrect: false, skipped: true },
    { points: 1, isCorrect: true, skipped: false },
  ];
  assert.deepEqual(computeScore(answers), {
    score: 2,
    correctAnswers: 2,
    wrongAnswers: 1,
    skippedAnswers: 1,
  });
});

test('friendship levels match the spec bands', () => {
  assert.equal(getFriendshipLevel(3, 15).label, 'Stranger');
  assert.equal(getFriendshipLevel(6, 15).label, 'Casual Friend');
  assert.equal(getFriendshipLevel(9, 15).label, 'Good Friend');
  assert.equal(getFriendshipLevel(12, 15).label, 'Bestie Material');
  assert.equal(getFriendshipLevel(15, 15).label, 'You Basically Live Together');
  assert.equal(getFriendshipLevel(0, 15).emoji, '😭');
});

test('dashboard stats compute averages and round sensibly', () => {
  const attempts = [
    { status: 'completed', score: 12 },
    { status: 'completed', score: 8 },
    { status: 'in_progress', score: 5 },
  ];
  const stats = computeDashboardStats(attempts, 15);
  assert.equal(stats.totalAttempts, 2);
  assert.equal(stats.averageScore, 10);
  assert.equal(stats.highestScore, 12);
  assert.equal(stats.lowestScore, 8);
  assert.equal(stats.averagePercentage, 66.7);
});

test('leaderboard sorts by score desc and ranks only completed attempts', () => {
  const attempts = [
    {
      status: 'completed',
      score: 8,
      totalQuestions: 15,
      participantName: 'B',
      completedAt: new Date('2024-01-02'),
      _id: 'b',
    },
    {
      status: 'completed',
      score: 12,
      totalQuestions: 15,
      participantName: 'A',
      completedAt: new Date('2024-01-01'),
      _id: 'a',
    },
    {
      status: 'in_progress',
      score: 14,
      totalQuestions: 15,
      participantName: 'C',
      completedAt: null,
      _id: 'c',
    },
  ];
  const board = buildLeaderboard(attempts);
  assert.equal(board.length, 2);
  assert.equal(board[0].participantName, 'A');
  assert.equal(board[0].rank, 1);
  assert.equal(board[1].participantName, 'B');
  assert.equal(board[1].rank, 2);
});
