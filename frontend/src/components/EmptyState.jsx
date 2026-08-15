export default function EmptyState({ emoji = '🫥', title, description, children }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-violet-200 bg-white/60 px-6 py-12 text-center">
      <div className="animate-float text-5xl">{emoji}</div>
      <h3 className="font-display text-xl font-bold text-slate-800">{title}</h3>
      {description && <p className="max-w-sm text-sm font-medium text-slate-500">{description}</p>}
      {children}
    </div>
  );
}
