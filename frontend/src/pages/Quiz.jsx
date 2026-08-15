import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiSend, FiX } from 'react-icons/fi';
import { useQuiz } from '../hooks/useQuiz.js';
import Button from '../components/Button.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { LoadingPage } from '../components/Loading.jsx';
import ErrorState from '../components/ErrorState.jsx';

export default function Quiz() {
  const { testCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { test, loading, error, attempt, currentIndex, currentQuestion, feedback, submitting, submit, next, totalQuestions } =
    useQuiz({ testCode, initialTest: location.state?.test ?? null });

  const [selected, setSelected] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');

  // Reset the answer inputs whenever the question changes
  useEffect(() => {
    setSelected(null);
    setTextAnswer('');
  }, [currentIndex]);

  // No attempt in progress — bounce back to the intro
  useEffect(() => {
    if (!loading && !attempt) navigate(`/t/${testCode}`, { replace: true });
  }, [loading, attempt, testCode, navigate]);

  if (loading) return <LoadingPage />;
  if (error) return <ErrorState emoji="😕" title="Something went wrong" message={error} />;
  if (!test || !attempt || !currentQuestion) return null;

  const isLast = currentIndex + 1 >= totalQuestions;
  const canSubmit = !feedback && !submitting && (currentQuestion.type === 'text' ? textAnswer.trim() : selected);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (currentQuestion.type === 'text') {
      await submit({ answer: textAnswer });
    } else {
      await submit({ answer: selected });
    }
  };

  const handleNext = async () => {
    const result = await next();
    if (result) {
      sessionStorage.setItem(`ft_result_${testCode}`, JSON.stringify(result));
      navigate(`/t/${testCode}/result`, { state: result, replace: true });
    }
  };

  const optionState = (optionId) => {
    if (!feedback) return selected === optionId ? 'selected' : 'idle';
    if (feedback.correctAnswer?.id === optionId) return 'correct';
    if (selected === optionId) return 'wrong';
    return 'idle';
  };

  return (
    <div className="animate-fade-up mx-auto max-w-2xl pt-8">
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-lg font-extrabold text-slate-800">
            Question {currentIndex + 1} <span className="text-slate-400">of {totalQuestions}</span>
          </span>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-extrabold text-violet-700">
            {Math.round(((currentIndex + (feedback ? 1 : 0)) / totalQuestions) * 100)}%
          </span>
        </div>
        <ProgressBar value={currentIndex + 1} max={totalQuestions} />
      </div>

      <div className="rounded-3xl border border-white bg-white/85 p-6 shadow-lg shadow-violet-100 backdrop-blur sm:p-8">
        <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {currentQuestion.questionText}
        </h1>

        {/* Options */}
        {currentQuestion.type === 'mcq' ? (
          <div className="mt-6 grid gap-3">
            {currentQuestion.options.map((option) => {
              const state = optionState(option.id);
              const styles = {
                idle: 'border-violet-100 bg-white hover:border-violet-300 hover:bg-violet-50',
                selected: 'border-violet-500 bg-violet-50 ring-2 ring-violet-200',
                correct: 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200',
                wrong: 'border-rose-400 bg-rose-50 ring-2 ring-rose-200 animate-shake',
              };
              return (
                <button
                  key={option.id}
                  disabled={!!feedback || submitting}
                  onClick={() => setSelected(option.id)}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left font-bold text-slate-700 transition-all duration-150 disabled:cursor-default ${styles[state]}`}
                >
                  {option.emoji && <span className="text-2xl">{option.emoji}</span>}
                  <span className="flex-1">{option.text}</span>
                  {state === 'correct' && <FiCheck className="text-xl text-emerald-500" />}
                  {state === 'wrong' && <FiX className="text-xl text-rose-500" />}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            disabled={!!feedback || submitting}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Type your answer…"
            maxLength={100}
            className="mt-6 w-full rounded-2xl border-2 border-violet-100 bg-white px-4 py-3.5 font-semibold text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        )}

        {/* Feedback */}
        {feedback && (
          <div
            className={`mt-6 animate-pop rounded-2xl border-2 p-5 ${
              feedback.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
            }`}
          >
            <div className="flex items-center gap-2 font-display text-lg font-extrabold">
              {feedback.isCorrect ? (
                <span className="text-emerald-600">✅ Correct! +1 Point</span>
              ) : (
                <span className="text-rose-600">❌ Wrong! +0 Points</span>
              )}
            </div>
            {!feedback.isCorrect && (
              <p className="mt-1.5 text-sm font-bold text-slate-600">
                Correct answer:{' '}
                <span className="text-slate-900">
                  {feedback.correctAnswer?.emoji ? `${feedback.correctAnswer.emoji} ` : ''}
                  {feedback.correctAnswer?.text ?? '—'}
                </span>
              </p>
            )}
            <div className="mt-4">
              <Button className="w-full sm:w-auto" icon={isLast ? FiCheck : FiArrowRight} onClick={handleNext}>
                {isLast ? 'See My Result 🎉' : 'Next Question'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {!feedback && (
        <div className="mt-5 flex justify-end">
          <Button icon={FiSend} onClick={handleSubmit} disabled={!canSubmit} loading={submitting}>
            Submit Answer
          </Button>
        </div>
      )}
    </div>
  );
}
