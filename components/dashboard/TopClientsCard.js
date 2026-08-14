import Link from 'next/link';

/**
 * Ranking de clientes con más equipos. Lista moderna con ranking, nombre,
 * subtítulo, cantidad y hover. Reutiliza los datos de stats.topClients.
 */
export default function TopClientsCard({ clients = [], loading }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 sm:p-7">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </span>
          Top Clientes con más Equipos
        </h2>
        <Link href="/admin/clientes" className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] inline-flex items-center gap-1">
          Ver todos
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="eq-skeleton h-14" />)}
        </div>
      ) : clients.length > 0 ? (
        <ul className="divide-y divide-slate-100">
          {clients.map((client, idx) => (
            <li key={client?.id || idx}>
              <div className="flex items-center gap-4 py-3.5 px-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-[var(--color-primary-soft2)] group-hover:text-[var(--color-primary-strong)] transition-colors">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-800 truncate">{client?.name || 'Cliente sin nombre'}</h4>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Cliente registrado</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-extrabold text-slate-900 tabular-nums">{client?.count ?? 0}</span>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase leading-none">Equipos</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center py-10 text-slate-400 italic text-sm">Aún no hay clientes registrados.</p>
      )}
    </div>
  );
}
