import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBarChart2, FiCheck, FiCopy, FiExternalLink, FiPlusCircle, FiUserCheck } from 'react-icons/fi';
import { claimTest, getErrorMessage, getMyTests } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { copyText } from '../utils/share.js';
import Button from '../components/Button.jsx';
import { LoadingPage } from '../components/Loading.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function MyTests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tests, setTests] = useState(null);
  const [error, setError] = useState(null);
  const [claimToken, setClaimToken] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState(null);
  const [copied, setCopied] = useState(null);

  const load = () => {
    getMyTests()
      .then((data) => setTests(data.tests))
      .catch((err) => setError(getErrorMessage(err, 'Could not load your tests.')));
  };

  useEffect(load, []);

  const handleClaim = async (e) => {
    e.preventDefault();
    if (claiming) return;
    setClaiming(true);
    setClaimMsg(null);
    try {
      await claimTest(claimToken);
      setClaimMsg('✅ Test added to your account!');
      setClaimToken('');
      load();
    } catch (err) {
      setClaimMsg(`❌ ${getErrorMessage(err, 'Could not claim that test.')}`);
    } finally {
      setClaiming(false);
    }
  };

  const copy = async (label, text) => {
    const ok = await copyText(text);
    setCopied(ok ? label : null);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!tests) return <LoadingPage />;

  return (
    <div className="animate-fade-up mx-auto max-w-3xl pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">
            My <span className="text-gradient">Tests</span>
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Hi {user?.username} 👋 — every test you create lives here.
          </p>
        </div>
        <Button icon={FiPlusCircle} onClick={() => navigate('/create')}>
          Create New Test
        </Button>
      </div>

      {error && <div className="mt-4"><ErrorState title="Something went wrong" message={error} /></div>}

      {/* Claim an existing test */}
      <div className="mt-6 rounded-3xl border-2 border-dashed border-violet-200 bg-violet-50/60 p-5">
        <div className="mb-1 text-xs font-extrabold uppercase tracking-wider text-violet-500">
          🔐 Have a test from before accounts existed?
        </div>
        <p className="text-sm font-semibold text-slate-500">
          Paste the private dashboard token from your test link (the <code>/dashboard/…</code> part) to add it to your account.
        </p>
        <form onSubmit={handleClaim} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={claimToken}
            onChange={(e) => setClaimToken(e.target.value)}
            placeholder="e.g. 9aK73mQ8pR2vX4tW"
            maxLength={64}
            className="flex-1 rounded-2xl border border-violet-200 bg-white px-4 py-2.5 font-semibold text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
          <Button type="submit" variant="secondary" icon={FiUserCheck} loading={claiming}>
            Claim Test
          </Button>
        </form>
        {claimMsg && <p className="mt-2 text-sm font-bold text-violet-700">{claimMsg}</p>}
      </div>

      {/* Test list */}
      {tests.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            emoji="📝"
            title="No tests yet"
            description="Create your first friendship test and it will show up here."
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {tests.map((t) => (
            <div
              key={t.testCode}
              className="rounded-3xl border border-white bg-white/85 p-6 shadow-lg shadow-violet-100 backdrop-blur"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-extrabold text-slate-900">
                    {t.creatorName}'s Test
                  </h2>
                  <p className="mt-0.5 text-sm font-semibold text-slate-500">
                    Code <code className="rounded bg-violet-50 px-1.5 py-0.5 font-bold text-violet-700">{t.testCode}</code>
                    {' · '}{t.totalQuestions} questions · {t.attempts} attempt{t.attempts === 1 ? '' : 's'}
                  </p>
                </div>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-extrabold text-violet-700">
                  {new Date(t.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/t/${t.testCode}`}>
                  <Button variant="secondary" size="sm" icon={FiExternalLink}>
                    Take Test
                  </Button>
                </Link>
                <Link to={`/dashboard/${t.dashboardToken}`}>
                  <Button variant="secondary" size="sm" icon={FiBarChart2}>
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={copied === t.testCode ? FiCheck : FiCopy}
                  onClick={() => copy(t.testCode, `${window.location.origin}/t/${t.testCode}`)}
                >
                  {copied === t.testCode ? 'Copied!' : 'Copy Share Link'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
