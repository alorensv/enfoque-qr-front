import ProfileMenu from './ProfileMenu';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

/* Título de sección por ruta (breadcrumb) */
const routeTitles = {
  '/admin/home': 'Dashboard',
  '/admin/usuarios': 'Usuarios',
  '/admin/clientes': 'Clientes',
  '/admin/equipos': 'Equipos',
  '/admin/documents': 'Documentos',
  '/admin/mantenciones': 'Mantenciones',
  '/admin/qr-universal': 'QR Universal',
  '/admin/perfil': 'Configuración',
};

function sectionTitle(pathname) {
  const match = Object.keys(routeTitles).find(
    (r) => pathname === r || pathname.startsWith(r + '/'),
  );
  return match ? routeTitles[match] : 'Panel';
}

export default function AdminHeader({ toggleSidebar }) {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleEditProfile = () => router.push('/admin/perfil');
  const title = sectionTitle(router.pathname);

  return (
    <>
      <header
        style={{
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
        className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4"
      >
        {/* Izquierda: hamburguesa (mobile) + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggleSidebar}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md transition-colors"
            style={{ color: 'var(--color-text-secondary)', background: 'var(--color-neutral-soft)' }}
            aria-label="Abrir menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <nav aria-label="Ubicación" className="hidden sm:flex items-center gap-2 min-w-0">
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Panel Admin</span>
            <svg className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }} className="truncate">{title}</span>
          </nav>
        </div>

        {/* Derecha: buscador + notificaciones + usuario */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Buscador (estilo suave). Placeholder de UI para búsqueda global. */}
          <div
            className="hidden md:flex items-center gap-2 px-3"
            style={{
              height: 38,
              width: 240,
              background: 'var(--color-surface-soft)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
            }}
          >
            <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="search"
              placeholder="Buscar…"
              aria-label="Buscar"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', width: '100%', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Notificaciones */}
          <button
            aria-label="Notificaciones"
            className="relative inline-flex items-center justify-center w-9 h-9 rounded-md transition-colors"
            style={{ color: 'var(--color-text-secondary)', background: 'var(--color-neutral-soft)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          <ProfileMenu user={user} onLogout={logout} onEditProfile={handleEditProfile} />
        </div>
      </header>
    </>
  );
}
