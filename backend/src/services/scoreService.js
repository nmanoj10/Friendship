const FRIENDSHIP_LEVELS = [
  { maxRatio: 0.27, label: 'Stranger', emoji: '😭' },
  { maxRatio: 0.5, label: 'Casual Friend', emoji: '🙂' },
  { maxRatio: 0.7, label: 'Good Friend', emoji: '😎' },
  { maxRatio: 0.9, label: 'Bestie Material', emoji: '❤️' },
  { maxRatio: 1.01, label: 'You Basically Live Together', emoji: '😂' },
];

export function computeScore(answers) {
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  for (const a of answers) {
    score += a.points;
    if (a.skipped) skipped += 1;
    else if (a.isCorrect) correct += 1;
    else wrong += 1;
  }
  return { score, correctAnswers: correct, wrongAnswers: wrong, skippedAnswers: skipped };
}

export function getFriendshipLevel(score, total) {
  if (!total || total <= 0) return { label: 'Mystery Friend', emoji: '🤔' };
  const ratio = score / total;
  return FRIENDSHIP_LEVELS.find((l) => ratio <= l.maxRatio) ?? FRIENDSHIP_LEVELS[FRIENDSHIP_LEVELS.length - 1];
}

export function computeDashboardStats(attempts, totalQuestions) {
  const completed = attempts.filter((a) => a.status === 'completed');
  if (completed.length === 0) {
    return {
      totalAttempts: 0,
      completedAttempts: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      averagePercentage: 0,
    };
  }
  const scores = completed.map((a) => a.score);
  const averageScore = scores.reduce((s, x) => s + x, 0) / scores.length;
  const averagePercentage = totalQuestions ? (averageScore / totalQuestions) * 100 : 0;
  return {
    totalAttempts: completed.length,
    completedAttempts: completed.length,
    averageScore: Math.round(averageScore * 10) / 10,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    averagePercentage: Math.round(averagePercentage * 10) / 10,
  };
}

export function buildLeaderboard(attempts) {
  return attempts
    .filter((a) => a.status === 'completed')
    .sort((a, b) => b.score - a.score || a.completedAt - b.completedAt)
    .map((a, i) => ({
      rank: i + 1,
      participantName: a.participantName,
      score: a.score,
      totalQuestions: a.totalQuestions,
      percentage: a.totalQuestions ? Math.round((a.score / a.totalQuestions) * 100) : 0,
      completedAt: a.completedAt,
      attemptId: a._id,
    }));
}

export function buildQuestionAnalytics(test, attempts) {
  const completed = attempts.filter((a) => a.status === 'completed');
  return test.questions.map((q) => {
    const stats = { correct: 0, wrong: 0, skipped: 0 };
    for (const attempt of completed) {
      const answer = attempt.answers.find((a) => String(a.questionId) === String(q._id));
      if (!answer) continue;
      if (answer.skipped) stats.skipped += 1;
      else if (answer.isCorrect) stats.correct += 1;
      else stats.wrong += 1;
    }
    return {
      questionId: q._id,
      questionText: q.questionText,
      type: q.type,
      ...stats,
      total: stats.correct + stats.wrong + stats.skipped,
    };
  });
}

export function buildScoreDistribution(attempts, totalQuestions) {
  const buckets = Array.from({ length: totalQuestions + 1 }, () => 0);
  for (const a of attempts) {
    if (a.status === 'completed' && a.score >= 0 && a.score <= totalQuestions) {
      buckets[a.score] += 1;
    }
  }
  return buckets.map((count, score) => ({ score, count }));
}
