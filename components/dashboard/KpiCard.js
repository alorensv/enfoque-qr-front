import Link from 'next/link';

/**
 * Tarjeta KPI del dashboard.
 * tone: 'primary' | 'info' | 'warning' | 'neutral' → color del ícono/soft.
 * percent (opcional): muestra "% de cobertura" + barra de progreso inferior.
 */
const tones = {
  primary: { soft: 'bg-[var(--color-primary-soft)]', fg: 'text-[var(--color-primary)]', bar: 'bg-[var(--color-primary-500)]' },
  info: { soft: 'bg-blue-50', fg: 'text-blue-600', bar: 'bg-blue-500' },
  warning: { soft: 'bg-amber-50', fg: 'text-amber-600', bar: 'bg-amber-500' },
  neutral: { soft: 'bg-slate-100', fg: 'text-slate-600', bar: 'bg-slate-400' },
};

export default function KpiCard({ title, value, icon, tone = 'primary', href, footerLabel, percent, loading }) {
  const t = tones[tone] || tones.primary;
  const hasProgress = typeof percent === 'number';

  const inner = (
    <div className="relative h-full bg-white rounded-2xl border border-slate-100 shadow-soft hover:shadow-card transition-all duration-200 overflow-hidden p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${t.soft} ${t.fg} group-hover:scale-105 transition-transform`}>
          {icon}
        </span>
        {href && (
          <svg className="w-4 h-4 text-slate-300 group-hover:text-[var(--color-primary)] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        )}
      </div>

      <div className="mt-4">
        <div className="text-3xl font-extrabold text-slate-900 leading-none tabular-nums">
          {loading ? '—' : value}
        </div>
        <div className="mt-1.5 text-[13px] font-medium text-slate-500">{title}</div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {hasProgress ? (
          <span className="text-xs font-semibold text-slate-400">{percent}% de cobertura</span>
        ) : (
          <span className="text-xs font-semibold text-[var(--color-primary)]">{footerLabel || 'Total activos'}</span>
        )}
      </div>

      {hasProgress && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
          <div className={`h-1 ${t.bar} transition-all duration-700`} style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded-2xl">
        {inner}
      </Link>
    );
  }
  return <div className="group h-full">{inner}</div>;
}
