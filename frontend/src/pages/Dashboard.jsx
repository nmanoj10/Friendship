import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FiCopy, FiUsers, FiTrendingUp, FiAward, FiPercent, FiCheck, FiArrowDown, FiActivity } from 'react-icons/fi';
import { getDashboard, getErrorMessage } from '../services/api.js';
import { copyText } from '../utils/share.js';
import { LoadingPage } from '../components/Loading.jsx';
import ErrorState from '../components/ErrorState.jsx';
import StatCard from '../components/StatCard.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Button from '../components/Button.jsx';
import ShareButton from '../components/ShareButton.jsx';

const DONUT_COLORS = ['#10b981', '#f43f5e', '#f59e0b'];

export default function Dashboard() {
  const { dashboardToken } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDashboard(dashboardToken)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Could not load this dashboard.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dashboardToken]);

  const donutData = useMemo(() => {
    if (!data) return [];
    const totals = data.questionAnalytics.reduce(
      (acc, q) => ({
        correct: acc.correct + q.correct,
        wrong: acc.wrong + q.wrong,
        skipped: acc.skipped + q.skipped,
      }),
      { correct: 0, wrong: 0, skipped: 0 }
    );
    return [
      { name: 'Correct', value: totals.correct },
      { name: 'Wrong', value: totals.wrong },
      { name: 'Skipped', value: totals.skipped },
    ].filter((d) => d.value > 0);
  }, [data]);

  if (loading) return <LoadingPage />;
  if (error) return <ErrorState emoji="🔐" title="Dashboard not found" message={error} />;
  if (!data) return null;

  const { test, stats, leaderboard, recentAttempts, questionAnalytics, scoreDistribution } = data;
  const shareUrl = `${window.location.origin}/t/${test.testCode}`;

  const copyLink = async () => {
    const ok = await copyText(shareUrl);
    setCopied(ok);
    setTimeout(() => setCopied(false), 2000);
  };

  const maxDist = Math.max(1, ...scoreDistribution.map((d) => d.count));

  return (
    <div className="animate-fade-up pt-8">
      {/* Header */}
      <div className="rounded-3xl bg-linear-to-br from-violet-500 via-fuchsia-500 to-orange-400 p-7 text-white shadow-xl shadow-fuchsia-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold">
              {test.creatorName}'s Test 📊
            </h1>
            <p className="mt-1 text-sm font-semibold text-white/90">
              {test.totalQuestions} questions · created{' '}
              {new Date(test.createdAt).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="hidden rounded-xl bg-white/20 px-3 py-2 text-sm font-bold backdrop-blur sm:block">
              {window.location.origin}/t/{test.testCode}
            </code>
            <Button
              variant="secondary"
              icon={copied ? FiCheck : FiCopy}
              onClick={copyLink}
              className="shadow-none"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <ShareButton title="Friendship test" text={`Take ${test.creatorName}'s friendship test and see how well you know them!`} url={shareUrl} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={FiUsers} label="Total Attempts" value={stats.totalAttempts} accent="violet" />
        <StatCard
          icon={FiTrendingUp}
          label="Average Score"
          value={`${stats.averageScore}/${test.totalQuestions}`}
          accent="fuchsia"
        />
        <StatCard icon={FiAward} label="Highest Score" value={`${stats.highestScore}/${test.totalQuestions}`} accent="amber" />
        <StatCard icon={FiArrowDown} label="Lowest Score" value={`${stats.lowestScore}/${test.totalQuestions}`} accent="sky" />
        <StatCard icon={FiPercent} label="Avg Accuracy" value={`${stats.averagePercentage}%`} accent="emerald" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm backdrop-blur">
          <h2 className="mb-4 font-display text-lg font-extrabold text-slate-900">
            Score Distribution
          </h2>
          {stats.totalAttempts === 0 ? (
            <EmptyState emoji="📊" title="No data yet" description="Charts appear once friends take the test." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scoreDistribution}>
                <XAxis dataKey="score" tick={{ fontSize: 12, fontWeight: 700 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(139,92,246,0.08)' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {scoreDistribution.map((d) => (
                    <Cell key={d.score} fill={d.count === maxDist ? '#ec4899' : '#a78bfa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm backdrop-blur">
          <h2 className="mb-4 font-display text-lg font-extrabold text-slate-900">
            Correct vs Wrong vs Skipped
          </h2>
          {donutData.length === 0 ? (
            <EmptyState emoji="🍩" title="No answers yet" description="Your donut will fill up as friends play." />
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ul className="space-y-2 text-sm font-bold text-slate-600">
                {donutData.map((d, i) => (
                  <li key={d.name} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                    {d.name}: {d.value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mt-8">
        <h2 className="mb-3 font-display text-xl font-extrabold text-slate-900">🏆 Leaderboard</h2>
        <Leaderboard entries={leaderboard} dashboardToken={dashboardToken} />
      </div>

      {/* Recent attempts */}
      <div className="mt-8">
        <h2 className="mb-3 font-display text-xl font-extrabold text-slate-900">🕒 Recent Attempts</h2>
        {recentAttempts.length === 0 ? (
          <EmptyState emoji="😴" title="Waiting for friends…" description="Nobody has completed the test yet. Share the link!" />
        ) : (
          <ul className="space-y-2">
            {recentAttempts.map((a) => (
              <li key={a.attemptId}>
                <Link
                  to={`/dashboard/${dashboardToken}/attempts/${a.attemptId}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 font-bold text-slate-700 transition-colors hover:border-violet-200 hover:bg-violet-50"
                >
                  <span className="flex items-center gap-2">
                    <FiActivity className="text-violet-500" />
                    {a.participantName}
                  </span>
                  <span className="text-sm text-slate-400">
                    {new Date(a.completedAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-extrabold text-violet-600">
                    {a.score}/{a.totalQuestions}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Question analytics */}
      <div className="mt-8">
        <h2 className="mb-3 font-display text-xl font-extrabold text-slate-900">🧐 Question Analytics</h2>
        <div className="space-y-3">
          {questionAnalytics.map((q, i) => {
            const total = q.total || 1;
            return (
              <div key={q.questionId} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-slate-800">
                    <span className="mr-1 text-violet-500">Q{i + 1}.</span> {q.questionText}
                  </p>
                  <p className="text-xs font-extrabold text-slate-400">
                    {q.correct} ✅ · {q.wrong} ❌ · {q.skipped} ⏭️
                  </p>
                </div>
                <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="bg-emerald-400" style={{ width: `${(q.correct / total) * 100}%` }} />
                  <div className="bg-rose-400" style={{ width: `${(q.wrong / total) * 100}%` }} />
                  <div className="bg-amber-400" style={{ width: `${(q.skipped / total) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
