import Link from 'next/link';

function greetingByHour(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/**
 * Encabezado amigable del dashboard: saludo por hora + nombre, subtítulo y
 * acción principal. Compacto (no un hero alto).
 */
export default function WelcomeBanner({ name }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
          ¡{greetingByHour()}, {name || 'Usuario'}! <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-1 text-slate-500 text-[15px]">
          Aquí tienes un resumen operativo de tu institución.
        </p>
      </div>
      <Link
        href="/admin/equipos/nuevo"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:translate-y-px shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
        Nuevo Equipo
      </Link>
    </div>
  );
}
