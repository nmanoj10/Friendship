import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useAuth, getErrorMessage } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/my-tests';

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, mode === 'login' ? 'Could not log in.' : 'Could not create your account.'));
      setSubmitting(false);
    }
  };

  const toggle = (next) => {
    setMode(next);
    setError(null);
  };

  return (
    <div className="animate-fade-up mx-auto max-w-md pt-10">
      <div className="rounded-3xl border border-white bg-white/85 p-8 shadow-lg shadow-violet-100 backdrop-blur">
        <div className="mb-4 text-center text-5xl">{mode === 'login' ? '👋' : '✨'}</div>
        <h1 className="text-center font-display text-3xl font-extrabold text-slate-900">
          {mode === 'login' ? (
            <>
              Welcome <span className="text-gradient">back!</span>
            </>
          ) : (
            <>
              Create your <span className="text-gradient">account</span>
            </>
          )}
        </h1>
        <p className="mt-1 text-center text-sm font-semibold text-slate-500">
          {mode === 'login'
            ? 'Log in to see all the tests you have created.'
            : 'Just a name and a password — no email needed.'}
        </p>

        {/* Mode toggle */}
        <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
          {[
            { value: 'login', label: 'Log In' },
            { value: 'register', label: 'Sign Up' },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => toggle(t.value)}
              className={`rounded-xl py-2 text-sm font-extrabold transition-colors ${
                mode === t.value
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-left text-sm font-bold text-slate-600">
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. snipers"
              autoComplete="username"
              maxLength={30}
              required
              className="mt-1.5 w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 font-semibold text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </label>
          <label className="block text-left text-sm font-bold text-slate-600">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={mode === 'register' ? 6 : undefined}
              required
              className="mt-1.5 w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 font-semibold text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </label>

          {error && <p className="text-sm font-bold text-rose-500">{error}</p>}

          <Button
            size="lg"
            className="w-full"
            type="submit"
            loading={submitting}
            icon={mode === 'login' ? FiLogIn : FiUserPlus}
          >
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs font-semibold text-slate-400">
          {mode === 'login' ? (
            <>
              No account yet?{' '}
              <button type="button" onClick={() => toggle('register')} className="font-bold text-violet-600 hover:underline">
                Sign up free
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => toggle('login')} className="font-bold text-violet-600 hover:underline">
                Log in
              </button>
            </>
          )}
        </p>
      </div>

      <p className="mt-4 text-center text-xs font-semibold text-slate-400">
        Prefer to just take a test?{' '}
        <Link to="/" className="text-violet-600 underline-offset-2 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
