import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowRight, FiPlay } from 'react-icons/fi';
import { getErrorMessage, getPublicTest, startAttempt } from '../services/api.js';
import { loadQuizProgress, quizStorageKey } from '../hooks/useQuiz.js';
import Button from '../components/Button.jsx';
import { LoadingPage } from '../components/Loading.jsx';
import ErrorState from '../components/ErrorState.jsx';

export default function TestIntro() {
  const { testCode } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [starting, setStarting] = useState(false);
  const [resume, setResume] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getPublicTest(testCode)
      .then((data) => {
        if (cancelled) return;
        setTest(data);
        const saved = loadQuizProgress(testCode);
        if (saved?.attemptId && saved.currentIndex < data.questions.length) {
          setResume(saved);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Test not found.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [testCode]);

  const handleStart = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || starting) return;
    setStarting(true);
    try {
      const attempt = await startAttempt(testCode, trimmed);
      localStorage.setItem(
        quizStorageKey(testCode),
        JSON.stringify({ attemptId: attempt.attemptId, participantName: attempt.participantName, currentIndex: 0 })
      );
      navigate(`/t/${testCode}/quiz`, { state: { test, attemptId: attempt.attemptId } });
    } catch (err) {
      setError(getErrorMessage(err, 'Could not start the test.'));
      setStarting(false);
    }
  };

  if (loading) return <LoadingPage />;
  if (error) return <ErrorState emoji="😕" title="Test not found" message={error} />;
  if (!test) return null;

  return (
    <div className="animate-fade-up mx-auto max-w-lg pt-10">
      <div className="rounded-3xl border border-white bg-white/85 p-8 text-center shadow-lg shadow-violet-100 backdrop-blur">
        <div className="mb-4 flex justify-center gap-3 text-5xl">
          <span className="animate-float">👀</span>
          <span className="animate-float-slow">🧐</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900">
          How Well Do You Know <span className="text-gradient">{test.creatorName}?</span>
        </h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          {test.totalQuestions} questions · Let's see how well you actually know your friend! 😎
        </p>

        {resume ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-bold text-violet-600">
              👋 Welcome back, {resume.participantName}! You were on question{' '}
              {resume.currentIndex + 1} of {test.totalQuestions}.
            </p>
            <Button
              size="lg"
              className="w-full"
              icon={FiPlay}
              onClick={() =>
                navigate(`/t/${testCode}/quiz`, { state: { test, attemptId: resume.attemptId } })
              }
            >
              Continue Quiz
            </Button>
            <button
              onClick={() => {
                localStorage.removeItem(quizStorageKey(testCode));
                setResume(null);
              }}
              className="text-xs font-bold text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
            >
              Start over with a new attempt
            </button>
          </div>
        ) : (
          <form onSubmit={handleStart} className="mt-6 space-y-3">
            <label className="block text-left text-sm font-bold text-slate-600">
              Enter your name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul"
                maxLength={50}
                required
                className="mt-1.5 w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 font-semibold text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <Button size="lg" className="w-full" type="submit" loading={starting} icon={FiArrowRight}>
              Start Quiz 🚀
            </Button>
          </form>
        )}

        <p className="mt-4 text-xs font-semibold text-slate-400">
          No login needed. Your score gets saved automatically.
        </p>
      </div>

      <p className="mt-4 text-center text-xs font-semibold text-slate-400">
        Made with 💜 by <span className="text-slate-600">{test.creatorName}</span> ·{' '}
        <Link to="/" className="underline-offset-2 hover:text-violet-600 hover:underline">
          Create your own test
        </Link>
      </p>
    </div>
  );
}
