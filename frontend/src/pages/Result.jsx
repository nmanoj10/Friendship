import { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiCheck, FiX } from 'react-icons/fi';
import { fireCelebration } from '../utils/celebration.js';
import ResultShareCard from '../components/ResultShareCard.jsx';
import Button from '../components/Button.jsx';
import ErrorState from '../components/ErrorState.jsx';

function AnswerRow({ item }) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="font-bold text-slate-800">{item.questionText}</p>
        {item.skipped ? (
          <p className="text-sm font-semibold text-amber-500">Skipped ⏭️</p>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-500">
              Your answer: {item.answerText || '—'}
            </p>
            {!item.isCorrect && item.correctAnswer && (
              <p className="text-sm font-semibold text-rose-500">
                Correct: {item.correctAnswer.emoji ? `${item.correctAnswer.emoji} ` : ''}
                {item.correctAnswer.text}
              </p>
            )}
          </>
        )}
      </div>
      <span className="shrink-0 text-lg font-extrabold">
        {item.skipped ? '⏭️' : item.isCorrect ? '✅' : '❌'}
      </span>
    </li>
  );
}

export default function Result() {
  const { testCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const result = useMemo(
    () => location.state ?? JSON.parse(sessionStorage.getItem(`ft_result_${testCode}`) ?? 'null'),
    [location.state, testCode]
  );

  // Celebrate — layered confetti scaled to the score
  useEffect(() => {
    if (!result) return undefined;
    return fireCelebration({ score: result.score, total: result.totalQuestions });
  }, [result]);

  if (!result) {
    return (
      <ErrorState
        emoji="🤷"
        title="No result found"
        message="Finish a quiz first to see your result."
      />
    );
  }

  const shareUrl = `${window.location.origin}/t/${testCode}`;

  return (
    <div className="animate-fade-up mx-auto max-w-2xl pt-8">
      <div className="rounded-3xl border border-white bg-white/85 p-8 text-center shadow-lg shadow-violet-100 backdrop-blur">
        <div className="text-6xl">🎉</div>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-slate-900">
          Test <span className="text-gradient">Completed!</span>
        </h1>
        <p className="mt-1 font-semibold text-slate-500">
          {result.participantName} scored
        </p>
        <div className="mt-4 font-display text-6xl font-extrabold text-slate-900">
          {result.score}
          <span className="text-3xl text-slate-400">/{result.totalQuestions}</span>
        </div>
        <p className="mt-1 text-sm font-extrabold text-violet-600">{result.percentage}% Correct</p>

        {/* Tally chips */}
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-extrabold">
          <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-emerald-700">
            ✅ {result.correctAnswers} Correct
          </span>
          <span className="rounded-full bg-rose-100 px-4 py-1.5 text-rose-700">
            ❌ {result.wrongAnswers} Wrong
          </span>
          <span className="rounded-full bg-amber-100 px-4 py-1.5 text-amber-700">
            ⏭️ {result.skippedAnswers} Skipped
          </span>
        </div>

        {/* Share / bragging card */}
        <div className="mt-7 text-left">
          <ResultShareCard
            participantName={result.participantName}
            creatorName={result.creatorName}
            score={result.score}
            total={result.totalQuestions}
            percentage={result.percentage}
            friendshipLevel={result.friendshipLevel}
            testLink={shareUrl}
          />
        </div>

        <div className="mt-6">
          <Link to={`/t/${testCode}`}>
            <Button variant="secondary" size="lg">
              Back to Test
            </Button>
          </Link>
        </div>
      </div>

      {/* Breakdown */}
      {result.breakdown?.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-xl font-extrabold text-slate-900">
            Answer Breakdown
          </h2>
          <ul className="space-y-2">
            {result.breakdown.map((item, i) => (
              <AnswerRow key={item.questionId ?? i} item={item} />
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 text-center text-sm font-semibold text-slate-400">
        ⚠️ One attempt per browser — make it count!{' '}
        <span className="inline-flex items-center gap-1">
          <FiCheck className="text-emerald-500" /> Completed
          <FiX className="text-rose-400" /> No retry
        </span>
      </p>
    </div>
  );
}
