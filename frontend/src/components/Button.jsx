import Loading from './Loading.jsx';

const STYLES = {
  primary:
    'bg-linear-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-200 hover:shadow-xl hover:shadow-fuchsia-300 hover:-translate-y-0.5',
  secondary:
    'bg-white text-violet-700 ring-1 ring-violet-200 hover:bg-violet-50 hover:ring-violet-300',
  ghost: 'text-violet-700 hover:bg-violet-100/70',
  success:
    'bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:-translate-y-0.5',
  light: 'bg-white/20 text-white ring-1 ring-white/40 hover:bg-white/30 backdrop-blur',
};

const SIZES = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  children,
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${STYLES[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loading size="sm" light />
      ) : (
        Icon && <Icon className="text-lg" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
