import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-white bg-white/80 px-6 py-16 text-center shadow-sm">
      <div className="animate-float text-7xl">🫥</div>
      <h1 className="font-display text-4xl font-extrabold text-slate-900">
        Page <span className="text-gradient">not found</span>
      </h1>
      <p className="max-w-md text-sm font-medium text-slate-500">
        This page wandered off… or the test link is wrong. Check the link and try again.
      </p>
      <Link to="/">
        <Button icon={() => null}>Back to Home</Button>
      </Link>
    </div>
  );
}
