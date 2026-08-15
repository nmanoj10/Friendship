const SIZES = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

export default function Loading({ size = 'md', light = false, label = 'Loading…' }) {
  return (
    <div role="status" aria-label={label} className="flex items-center justify-center gap-3">
      <div
        className={`${SIZES[size]} animate-spin rounded-full border-[3px] ${
          light ? 'border-white/30 border-t-white' : 'border-violet-200 border-t-violet-600'
        }`}
      />
      {label && <span className="text-sm font-semibold text-slate-500">{label}</span>}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loading size="lg" />
    </div>
  );
}
