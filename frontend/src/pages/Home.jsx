import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiPlusCircle, FiPlay } from 'react-icons/fi';
import { FaUserGroup, FaListCheck, FaLink, FaChartLine, FaTrophy, FaMobileScreenButton } from 'react-icons/fa6';
import Button from '../components/Button.jsx';

const STEPS = [
  {
    emoji: '✨',
    title: 'Create',
    text: 'Pick 15 fun questions and set your answers.',
  },
  {
    emoji: '🔗',
    title: 'Share',
    text: 'Get your unique test link in one tap.',
  },
  {
    emoji: '💬',
    title: 'Challenge',
    text: 'Send it to your friends and classmates.',
  },
  {
    emoji: '🏆',
    title: 'Discover',
    text: 'See who knows you best on your dashboard.',
  },
];

const FEATURES = [
  { emoji: '🧠', title: '15 Questions', text: 'A fun 15-question challenge, one question at a time.' },
  { emoji: '🎯', title: 'MCQ + Text', text: 'Mix multiple-choice and custom-answer questions.' },
  { emoji: '🔗', title: 'Unique Link', text: 'Every test gets its own short, shareable link.' },
  { emoji: '📊', title: 'Live Dashboard', text: 'See how every friend performed in real time.' },
  { emoji: '🏆', title: 'Leaderboard', text: 'Find out once and for all who your bestie is.' },
  { emoji: '📱', title: 'Mobile Friendly', text: 'Works beautifully on phones, tablets and desktops.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const goToTest = (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed) navigate(`/t/${trimmed}`);
  };

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="pt-10 pb-14 text-center sm:pt-16">
        <div className="mb-6 flex justify-center gap-4 text-5xl sm:text-6xl">
          <span className="animate-float">🤔</span>
          <span className="animate-float-slow">👯</span>
          <span className="animate-float" style={{ animationDelay: '1.2s' }}>🎉</span>
        </div>
        <h1 className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-tight text-slate-900 sm:text-6xl">
          How Well Do Your Friends <span className="text-gradient">Really Know You?</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base font-semibold text-slate-500 sm:text-lg">
          Create your own friendship test, share it with your classmates, and discover who actually
          knows you best!
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/create">
            <Button size="lg" icon={FiPlusCircle}>
              Create My Test
            </Button>
          </Link>
          <form onSubmit={goToTest} className="flex items-center gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Have a code? e.g. Ab82Kx"
              aria-label="Test code"
              className="w-52 rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 sm:w-64"
            />
            <Button variant="secondary" size="lg" icon={FiPlay} type="submit">
              Take a Test
            </Button>
          </form>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-12">
        <h2 className="text-center font-display text-3xl font-extrabold text-slate-900">
          How it <span className="text-gradient">works</span>
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="relative rounded-3xl border border-white bg-white/80 p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1"
            >
              <span className="absolute top-4 right-5 font-display text-4xl font-extrabold text-violet-100">
                {i + 1}
              </span>
              <div className="mb-3 text-4xl">{s.emoji}</div>
              <h3 className="font-display text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <h2 className="text-center font-display text-3xl font-extrabold text-slate-900">
          Why you'll <span className="text-gradient">love it</span>
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-4 rounded-3xl border border-white bg-white/80 p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-2xl">
                {f.emoji}
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">{f.title}</h3>
                <p className="mt-0.5 text-sm font-medium text-slate-500">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 p-10 text-center text-white shadow-xl shadow-fuchsia-200">
          <FaUserGroup className="mx-auto mb-4 text-5xl" aria-hidden="true" />
          <h2 className="font-display text-3xl font-extrabold">Ready to test your friends?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-white/90">
            Takes 2 minutes to create. The bragging rights last forever. 😎
          </p>
          <div className="mt-6">
            <Link to="/create">
              <Button
                size="lg"
                variant="secondary"
                icon={FiArrowRight}
                className="shadow-none"
              >
                Create My Test — It's Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof icons strip */}
      <section className="py-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-bold text-slate-400">
          <span className="inline-flex items-center gap-2"><FaListCheck /> MCQ + Text</span>
          <span className="inline-flex items-center gap-2"><FaLink /> Short links</span>
          <span className="inline-flex items-center gap-2"><FaChartLine /> Live stats</span>
          <span className="inline-flex items-center gap-2"><FaTrophy /> Leaderboards</span>
          <span className="inline-flex items-center gap-2"><FaMobileScreenButton /> 100% responsive</span>
        </div>
      </section>
    </div>
  );
}
