import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCheck, FiCopy, FiExternalLink, FiPlusCircle, FiX, FiZap } from 'react-icons/fi';
import {
  CATEGORIES,
  EMOJI_PALETTE,
  QUESTION_BANK,
  QUESTION_BANK_BY_ID,
  bankQuestionToConfig,
} from '../data/questionBank.js';
import { createTest, getErrorMessage } from '../services/api.js';
import { copyText } from '../utils/share.js';
import Button from '../components/Button.jsx';
import ErrorState from '../components/ErrorState.jsx';

const TOTAL_QUESTIONS = 15;
const STEPS = ['Your Name', 'Pick Questions', 'Set Answers', 'Share'];

// A brand-new question: text answer by default (simplest), with 4 options ready in case the
// creator switches it to multiple choice in the "Set answers" step
function customQuestionToConfig() {
  return {
    type: 'text',
    options: ['a', 'b', 'c', 'd'].map((id) => ({ id, text: '', emoji: '' })),
    correctOptionId: null,
    textAnswer: '',
  };
}

function StepIndicator({ current }) {
  return (
    <ol className="mb-8 flex items-center justify-center gap-2">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-sm font-extrabold transition-colors ${
                done
                  ? 'bg-emerald-500 text-white'
                  : active
                    ? 'bg-linear-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-fuchsia-200'
                    : 'bg-slate-200 text-slate-500'
              }`}
            >
              {done ? <FiCheck /> : i + 1}
            </span>
            <span className={`hidden text-sm font-bold sm:block ${active ? 'text-slate-900' : 'text-slate-400'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="h-0.5 w-4 rounded bg-slate-200 sm:w-8" />}
          </li>
        );
      })}
    </ol>
  );
}

export default function CreateTest() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [customQuestions, setCustomQuestions] = useState([]);
  const [customText, setCustomText] = useState('');
  const [configs, setConfigs] = useState({});
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(null);
  const [openEmoji, setOpenEmoji] = useState(null); // { id, index }

  const totalPicked = selectedIds.length + customQuestions.length;

  // Bank questions + custom questions, in one list for the "Set answers" step
  const selectedQuestions = useMemo(
    () => [
      ...selectedIds.map((id) => ({ id, questionText: QUESTION_BANK_BY_ID[id]?.questionText ?? '' })),
      ...customQuestions,
    ],
    [selectedIds, customQuestions]
  );

  const toggleQuestion = (id) => {
    setError(null);
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length + customQuestions.length >= TOTAL_QUESTIONS) return prev;
      return [...prev, id];
    });
  };

  const addCustomQuestion = () => {
    const text = customText.trim();
    if (!text) {
      setError('Enter your question first.');
      return;
    }
    if (totalPicked >= TOTAL_QUESTIONS) {
      setError(`You can have at most ${TOTAL_QUESTIONS} questions in total.`);
      return;
    }
    const id = `custom-${Date.now()}`;
    setCustomQuestions((prev) => [...prev, { id, questionText: text }]);
    setConfigs((prev) => ({ ...prev, [id]: customQuestionToConfig() }));
    setCustomText('');
    setError(null);
  };

  const removeCustomQuestion = (id) => {
    setCustomQuestions((prev) => prev.filter((c) => c.id !== id));
    setConfigs((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const goToConfigure = () => {
    if (totalPicked !== TOTAL_QUESTIONS) {
      setError(`Pick exactly ${TOTAL_QUESTIONS} questions (you've chosen ${totalPicked}).`);
      return;
    }
    setConfigs((prev) => {
      const next = { ...prev };
      for (const id of selectedIds) {
        if (!next[id]) next[id] = bankQuestionToConfig(QUESTION_BANK_BY_ID[id]);
      }
      for (const c of customQuestions) {
        if (!next[c.id]) next[c.id] = customQuestionToConfig();
      }
      return next;
    });
    setStep(2);
  };

  // ── Config helpers ──────────────────────────────────────────
  const setType = (id, type) =>
    setConfigs((prev) => ({ ...prev, [id]: { ...prev[id], type } }));

  const setOption = (id, index, field, value) =>
    setConfigs((prev) => {
      const options = prev[id].options.map((o, i) => (i === index ? { ...o, [field]: value } : o));
      return { ...prev, [id]: { ...prev[id], options } };
    });

  const setCorrect = (id, optionId) =>
    setConfigs((prev) => ({ ...prev, [id]: { ...prev[id], correctOptionId: optionId } }));

  const setTextAnswer = (id, value) =>
    setConfigs((prev) => ({ ...prev, [id]: { ...prev[id], textAnswer: value } }));

  const configErrors = useMemo(() => {
    const errors = {};
    for (const q of selectedQuestions) {
      const c = configs[q.id];
      if (!c) continue;
      if (c.type === 'mcq') {
        if (c.options.some((o) => !o.text.trim())) errors[q.id] = 'Fill in all option texts.';
        else if (!c.correctOptionId) errors[q.id] = 'Select the correct answer.';
      } else if (!c.textAnswer.trim()) {
        errors[q.id] = 'Enter the correct answer.';
      }
    }
    return errors;
  }, [configs, selectedQuestions]);

  const handleCreate = async () => {
    if (Object.keys(configErrors).length > 0 || creating) return;
    setCreating(true);
    setError(null);
    try {
      const payload = {
        creatorName: name,
        questions: selectedQuestions.map((q) => {
          const c = configs[q.id];
          if (c.type === 'mcq') {
            return {
              questionText: q.questionText,
              type: 'mcq',
              options: c.options.map((o) => ({ id: o.id, text: o.text.trim(), emoji: o.emoji })),
              correctAnswerIndex: c.options.findIndex((o) => o.id === c.correctOptionId),
            };
          }
          return { questionText: q.questionText, type: 'text', correctAnswer: c.textAnswer.trim() };
        }),
      };
      const res = await createTest(payload);
      setCreated(res);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create your test.'));
    } finally {
      setCreating(false);
    }
  };

  const copy = async (label, text) => {
    const ok = await copyText(text);
    setCopied(ok ? label : null);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Render steps ────────────────────────────────────────────
  return (
    <div className="animate-fade-up mx-auto max-w-3xl pt-8">
      <StepIndicator current={step} />

      {/* STEP 1 — Name */}
      {step === 0 && (
        <div className="rounded-3xl border border-white bg-white/85 p-8 shadow-lg shadow-violet-100 backdrop-blur">
          <div className="mb-2 text-4xl">✍️</div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">
            First, <span className="text-gradient">your name</span>
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            This is the name your friends will see — "How well do you know X?"
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Manoj"
            maxLength={50}
            className="mt-5 w-full rounded-2xl border-2 border-violet-100 bg-white px-4 py-3.5 text-lg font-bold text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
          <div className="mt-6 flex justify-end">
            <Button size="lg" icon={FiArrowRight} disabled={!name.trim()} onClick={() => setStep(1)}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2 — Pick questions */}
      {step === 1 && (
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Pick your <span className="text-gradient">15 questions</span>
            </h1>
            <span
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-extrabold ${
                totalPicked === TOTAL_QUESTIONS
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-violet-100 text-violet-700'
              }`}
            >
              {totalPicked}/{TOTAL_QUESTIONS}
            </span>
          </div>
          <p className="mb-6 text-sm font-semibold text-slate-500">
            Choose from the bank or write your own below — you'll set your answers in the next
            step.
          </p>

          {CATEGORIES.map((category) => {
            const items = QUESTION_BANK.filter((q) => q.category === category);
            return (
              <section key={category} className="mb-6">
                <h2 className="mb-2 font-display text-lg font-extrabold text-slate-700">
                  {category}
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map((q) => {
                    const selected = selectedIds.includes(q.id);
                    const full = totalPicked >= TOTAL_QUESTIONS && !selected;
                    return (
                      <button
                        key={q.id}
                        onClick={() => toggleQuestion(q.id)}
                        disabled={full}
                        className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                          selected
                            ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200'
                            : 'border-slate-100 bg-white hover:border-violet-200'
                        }`}
                      >
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-xs text-white ${
                            selected ? 'bg-violet-500' : 'bg-slate-200'
                          }`}
                        >
                          {selected && <FiCheck />}
                        </span>
                        <span className="text-sm text-slate-700">{q.questionText}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* Custom questions */}
          <section className="mb-6">
            <h2 className="mb-2 font-display text-lg font-extrabold text-slate-700">
              ✍️ Your Own Questions
            </h2>
            <p className="mb-3 text-sm font-semibold text-slate-500">
              Got something better than the bank? Write your own question — you'll set the options
              and answer in the next step.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomQuestion()}
                placeholder="e.g. What's my biggest secret?"
                maxLength={120}
                className="flex-1 rounded-2xl border-2 border-fuchsia-100 bg-white px-4 py-2.5 font-semibold text-slate-700 placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
              />
              <Button variant="secondary" icon={FiPlusCircle} onClick={addCustomQuestion}>
                Add Question
              </Button>
            </div>
            {customQuestions.length > 0 && (
              <div className="mt-3 space-y-2">
                {customQuestions.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-2xl border-2 border-fuchsia-200 bg-fuchsia-50/60 px-4 py-3"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-fuchsia-500 text-xs text-white">
                      ✍️
                    </span>
                    <span className="flex-1 text-sm font-bold text-slate-700">{c.questionText}</span>
                    <button
                      onClick={() => removeCustomQuestion(c.id)}
                      title="Remove this question"
                      aria-label="Remove question"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-rose-100 hover:text-rose-600"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {error && <p className="mb-3 text-sm font-bold text-rose-500">{error}</p>}
          <div className="flex justify-between">
            <Button variant="ghost" icon={FiArrowLeft} onClick={() => setStep(0)}>
              Back
            </Button>
            <Button size="lg" icon={FiArrowRight} onClick={goToConfigure}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3 — Configure answers */}
      {step === 2 && (
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Set your <span className="text-gradient">answers</span>
          </h1>
          <p className="mb-6 text-sm font-semibold text-slate-500">
            For each question, pick the answer type and tell us the correct answer. Your friends
            will never see these until after they answer! 🤫
          </p>

          <div className="space-y-5">
            {selectedQuestions.map((q, qi) => {
              const c = configs[q.id];
              if (!c) return null;
              const err = configErrors[q.id];
              return (
                <div
                  key={q.id}
                  className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg font-extrabold text-slate-900">
                      <span className="mr-1 text-violet-500">Q{qi + 1}.</span> {q.questionText}
                    </h2>
                    <span className="shrink-0 rounded-full bg-violet-100 px-3 py-1 text-xs font-extrabold text-violet-700">
                      {c.type === 'mcq' ? 'Multiple Choice' : 'Text Answer'}
                    </span>
                  </div>

                  {/* Type toggle */}
                  <div className="mt-3 flex gap-2">
                    {[
                      { value: 'mcq', label: '🎯 Multiple Choice' },
                      { value: 'text', label: '⌨️ Text Answer' },
                    ].map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setType(q.id, t.value)}
                        className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                          c.type === t.value
                            ? 'bg-linear-to-r from-violet-500 to-fuchsia-500 text-white shadow-md shadow-fuchsia-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {c.type === 'mcq' ? (
                    <div className="mt-4 space-y-2">
                      {c.options.map((option, oi) => (
                        <div key={option.id}>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setOpenEmoji(openEmoji?.id === q.id && openEmoji.index === oi ? null : { id: q.id, index: oi })
                              }
                              title="Choose an emoji"
                              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-xl hover:bg-violet-100"
                            >
                              {option.emoji || '🫥'}
                            </button>
                            <input
                              value={option.text}
                              onChange={(e) => setOption(q.id, oi, 'text', e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                              maxLength={40}
                              className="w-full rounded-xl border-2 border-slate-100 bg-white px-3 py-2.5 font-semibold text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none"
                            />
                            <button
                              onClick={() => setCorrect(q.id, option.id)}
                              title="Mark as correct answer"
                              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-extrabold transition-colors ${
                                c.correctOptionId === option.id
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              <FiCheck /> Correct
                            </button>
                          </div>
                          {openEmoji?.id === q.id && openEmoji.index === oi && (
                            <div className="mt-2 grid grid-cols-10 gap-1 rounded-2xl bg-violet-50 p-2 sm:grid-cols-14">
                              {EMOJI_PALETTE.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => {
                                    setOption(q.id, oi, 'emoji', emoji);
                                    setOpenEmoji(null);
                                  }}
                                  className="grid h-8 w-8 place-items-center rounded-lg text-lg hover:bg-white"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <label className="text-sm font-bold text-slate-600">
                        Correct answer (what would you say?)
                        <input
                          value={c.textAnswer}
                          onChange={(e) => setTextAnswer(q.id, e.target.value)}
                          placeholder="e.g. Biryani"
                          maxLength={100}
                          className="mt-1.5 w-full rounded-xl border-2 border-slate-100 bg-white px-3 py-2.5 font-semibold text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none"
                        />
                      </label>
                    </div>
                  )}

                  {err && <p className="mt-2 text-sm font-bold text-rose-500">{err}</p>}
                </div>
              );
            })}
          </div>

          {error && <p className="mt-4 text-sm font-bold text-rose-500">{error}</p>}
          <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row">
            <Button variant="ghost" icon={FiArrowLeft} onClick={() => setStep(1)}>
              Back
            </Button>
            <Button size="lg" icon={FiZap} onClick={handleCreate} loading={creating}>
              Create My Test 🚀
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4 — Share */}
      {step === 3 && created && (
        <div className="animate-pop">
          <div className="rounded-3xl border border-white bg-white/85 p-8 text-center shadow-lg shadow-violet-100 backdrop-blur">
            <div className="text-6xl">🎊</div>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-slate-900">
              Your test is <span className="text-gradient">live!</span>
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Share this link with your friends — they just enter their name and start.{' '}
              {created.totalQuestions} questions await them.
            </p>

            <div className="mx-auto mt-6 max-w-md space-y-4">
              <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/60 p-4">
                <div className="mb-1 text-xs font-extrabold uppercase tracking-wider text-violet-500">
                  🔗 Share link (send this to friends)
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-xl bg-white px-3 py-2 text-sm font-bold text-violet-700">
                    {window.location.origin}/t/{created.testCode}
                  </code>
                  <Button size="sm" variant="secondary" icon={copied === 'share' ? FiCheck : FiCopy} onClick={() => copy('share', `${window.location.origin}/t/${created.testCode}`)}>
                    {copied === 'share' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-slate-100 bg-white p-4">
                <div className="mb-1 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  🔐 Dashboard link (keep this private!)
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-500">
                    /dashboard/{created.dashboardToken}
                  </code>
                  <Button size="sm" variant="secondary" icon={copied === 'dash' ? FiCheck : FiCopy} onClick={() => copy('dash', `${window.location.origin}/dashboard/${created.dashboardToken}`)}>
                    {copied === 'dash' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={`/dashboard/${created.dashboardToken}`}>
                <Button size="lg" icon={FiExternalLink}>
                  Go to Dashboard
                </Button>
              </Link>
              <Link to={`/t/${created.testCode}`}>
                <Button variant="secondary" size="lg">
                  Preview My Test 👀
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {error && step !== 1 && step !== 2 && (
        <div className="mt-4">
          <ErrorState title="Something went wrong" message={error} />
        </div>
      )}
    </div>
  );
}
