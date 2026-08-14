/**
 * Resumen general (card secundaria, no compite con los KPI principales).
 * Fondo blanco, borde sutil, iconografía discreta y una barra de eficiencia.
 */
export default function GeneralSummaryCard({ users = 0, clients = 0, efficiency = 0, loading }) {
  // Eficiencia QR = escaneos por equipo. Barra relativa a un objetivo de 10 p/e.
  const pct = Math.min(100, Math.round((Number(efficiency) / 10) * 100)) || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17V9m4 8V5m4 12v-6M4 21h16" /></svg>
        </span>
        Resumen General
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Usuarios totales</span>
          <span className="font-bold text-slate-900 tabular-nums">{loading ? '—' : users}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Clientes totales</span>
          <span className="font-bold text-slate-900 tabular-nums">{loading ? '—' : clients}</span>
        </div>

        <hr className="border-slate-100" />

        <div className="pt-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-primary)]">Eficiencia QR</span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">{loading ? '—' : `${efficiency} p/e`}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Eficiencia QR">
            <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'var(--color-primary-500)' }} />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Escaneos promedio por equipo.</p>
        </div>
      </div>
    </div>
  );
}
