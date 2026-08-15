import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';
import { getAttemptDetail, getErrorMessage } from '../services/api.js';
import { LoadingPage } from '../components/Loading.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Button from '../components/Button.jsx';

export default function AttemptDetail() {
  const { dashboardToken, attemptId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAttemptDetail(dashboardToken, attemptId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Could not load this attempt.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dashboardToken, attemptId]);

  if (loading) return <LoadingPage />;
  if (error) return <ErrorState emoji="😕" title="Attempt not found" message={error} />;
  if (!data) return null;

  return (
    <div className="animate-fade-up mx-auto max-w-2xl pt-8">
      <Link to={`/dashboard/${dashboardToken}`}>
        <Button variant="ghost" icon={FiArrowLeft} size="sm">
          Back to Dashboard
        </Button>
      </Link>

      <div className="mt-4 rounded-3xl border border-white bg-white/85 p-7 shadow-lg shadow-violet-100 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900">
              {data.participantName}'s <span className="text-gradient">Answers</span>
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {data.status === 'completed' ? (
                <>
                  Completed{' '}
                  {data.completedAt
                    ? new Date(data.completedAt).toLocaleString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </>
              ) : (
                'Still in progress…'
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="font-display text-4xl font-extrabold text-violet-600">
              {data.score}
              <span className="text-xl text-slate-400">/{data.totalQuestions}</span>
            </div>
            <div className="flex justify-end gap-2 text-xs font-extrabold">
              <span className="text-emerald-600">✅ {data.correctAnswers}</span>
              <span className="text-rose-500">❌ {data.wrongAnswers}</span>
              <span className="text-amber-500">⏭️ {data.skippedAnswers}</span>
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-6 space-y-2">
        {data.breakdown.map((item, i) => (
          <li
            key={item.questionId ?? i}
            className="rounded-2xl border border-slate-100 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-bold text-slate-800">
                <span className="mr-1 text-violet-500">Q{i + 1}.</span> {item.questionText}
              </p>
              <span className="shrink-0 text-lg font-extrabold">
                {item.skipped ? '⏭️' : item.isCorrect ? '✅' : '❌'}
              </span>
            </div>
            <div className="mt-1.5 space-y-0.5 text-sm font-semibold">
              {item.skipped ? (
                <p className="text-amber-500">Skipped</p>
              ) : (
                <>
                  <p className="text-slate-500">Answer: {item.answerText || '—'}</p>
                  {!item.isCorrect && item.correctAnswer && (
                    <p className="flex items-center gap-1 text-rose-500">
                      <FiX /> Correct: {item.correctAnswer.emoji ? `${item.correctAnswer.emoji} ` : ''}
                      {item.correctAnswer.text}
                    </p>
                  )}
                  {item.isCorrect && (
                    <p className="flex items-center gap-1 text-emerald-600">
                      <FiCheck /> Correct!
                    </p>
                  )}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
