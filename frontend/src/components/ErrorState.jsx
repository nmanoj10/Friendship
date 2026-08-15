import Button from './Button.jsx';

export default function ErrorState({ emoji = '😕', title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-white bg-white/80 px-6 py-14 text-center shadow-sm">
      <div className="animate-wiggle text-6xl">{emoji}</div>
      <h1 className="font-display text-2xl font-bold text-slate-900">{title}</h1>
      {message && <p className="max-w-md text-sm font-medium text-slate-500">{message}</p>}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
