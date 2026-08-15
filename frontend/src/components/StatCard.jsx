const ACCENTS = {
  violet: 'from-violet-500 to-purple-500',
  fuchsia: 'from-fuchsia-500 to-pink-500',
  amber: 'from-amber-400 to-orange-500',
  emerald: 'from-emerald-400 to-teal-500',
  sky: 'from-sky-400 to-blue-500',
};

export default function StatCard({ icon: Icon, label, value, sub, accent = 'violet' }) {
  return (
    <div className="rounded-3xl border border-white bg-white/80 p-5 shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5">
      <div
        className={`mb-3 inline-grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-xl text-white shadow-md ${ACCENTS[accent]}`}
      >
        <Icon aria-hidden="true" />
      </div>
      <div className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</div>
      <div className="text-sm font-bold text-slate-500">{label}</div>
      {sub && <div className="mt-1 text-xs font-semibold text-slate-400">{sub}</div>}
    </div>
  );
}
