import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { displayName, roleLabel, initials as getInitials } from '../lib/user';

/* ─── Íconos SVG inline (lineales, una sola familia) ─────────────── */
const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  usuarios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21a7 7 0 0 1 14 0" />
      <path d="M19 11v6m-3-3h6" />
    </svg>
  ),
  clientes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14" />
      <path d="M3 21h18" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 10h.01M15 10h.01M12 10h.01" />
    </svg>
  ),
  equipos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 18v3" />
    </svg>
  ),
  documentos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  ),
  mantenciones: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  qr: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="5" rx="1" />
      <rect x="16" y="3" width="5" height="5" rx="1" />
      <rect x="3" y="16" width="5" height="5" rx="1" />
      <path d="M16 16h.01M16 19h.01M19 16h.01M19 19h.01M13 3v5M3 13h5M13 13h.01M13 16h.01M13 19h.01" />
    </svg>
  ),
  config: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  chevronLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
};

/* ─── Menú ────────────────────────────────────────────────────────── */
const menu = [
  { label: 'Dashboard',    icon: icons.dashboard,    href: '/admin/home' },
  { label: 'Usuarios',     icon: icons.usuarios,     href: '/admin/usuarios' },
  { label: 'Clientes',     icon: icons.clientes,     href: '/admin/clientes' },
  { label: 'Equipos',      icon: icons.equipos,      href: '/admin/equipos' },
  { label: 'Documentos',   icon: icons.documentos,   href: '/admin/documents' },
  { label: 'Mantenciones', icon: icons.mantenciones, href: '/admin/mantenciones' },
  { label: 'QR Universal', icon: icons.qr,           href: '/admin/qr-universal' },
];

/* ─── Base del sidebar (tema claro) ──────────────────────────────── */
const sidebarBase = {
  display: 'flex',
  flexDirection: 'column',
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  background: 'var(--color-surface)',
  borderRight: '1px solid var(--color-border)',
  overflowX: 'hidden',
  overflowY: 'auto',
  zIndex: 50,
};

export default function AdminSidebar({ isOpen, closeSidebar }) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const router = useRouter();

  const isActive = (href) =>
    router.pathname === href || router.pathname.startsWith(href + '/');

  const sidebarWidth = isCollapsed ? 72 : 244;

  const filteredMenu = menu.filter((item) => {
    if (user?.role === 'institution_user') {
      return !['Usuarios', 'Clientes'].includes(item.label);
    }
    return true;
  });

  const contentProps = {
    isCollapsed,
    setIsCollapsed,
    hoveredItem,
    setHoveredItem,
    menu: filteredMenu,
    isActive,
    user,
  };

  return (
    <>
      {/* Overlay mobile */}
      <div
        onClick={closeSidebar}
        className="lg:hidden"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(15,23,42,0.45)',
          backdropFilter: 'blur(2px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s',
        }}
        aria-hidden="true"
      />

      {/* MOBILE: off-canvas */}
      <aside
        className="lg:hidden"
        style={{
          ...sidebarBase,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: sidebarWidth,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '4px 0 32px rgba(15,23,42,0.12)',
        }}
      >
        <SidebarContent {...contentProps} onNavigate={closeSidebar} />
      </aside>

      {/* DESKTOP: sticky en el flujo */}
      <aside
        className="hidden lg:flex"
        style={{
          ...sidebarBase,
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0,
          width: sidebarWidth,
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <SidebarContent {...contentProps} />
      </aside>
    </>
  );
}

/* ─── Marca ───────────────────────────────────────────────────────── */
function BrandMark({ isCollapsed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-500) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: 'var(--shadow-md)',
        }}
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <path d="M14 14h3M14 21h3M21 14v.01M21 17v4M17 17.5h.01" />
        </svg>
      </span>
      {!isCollapsed && (
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, minWidth: 0 }}>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Enfoque QR
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Panel Admin
          </span>
        </span>
      )}
    </div>
  );
}

/* ─── Contenido interno ──────────────────────────────────────────── */
function SidebarContent({ isCollapsed, setIsCollapsed, hoveredItem, setHoveredItem, menu, isActive, user, onNavigate }) {
  const initials = getInitials(user);
  const configActive = isActive('/admin/perfil');

  return (
    <>
      {/* Branding */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '1rem 0' : '1.1rem 1.1rem',
          borderBottom: '1px solid var(--color-border-soft)',
          minHeight: 66,
          flexShrink: 0,
        }}
      >
        {!isCollapsed && <BrandMark isCollapsed={isCollapsed} />}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
          aria-label={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
          className="hidden lg:flex"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-neutral-soft)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
        >
          <span style={{ display: 'flex', width: 15, height: 15, transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
            {icons.chevronLeft}
          </span>
        </button>
      </div>

      {/* Etiqueta de sección */}
      {!isCollapsed && (
        <div style={{ padding: '1.1rem 1.35rem 0.5rem', color: 'var(--color-text-muted)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, flexShrink: 0 }}>
          Navegación
        </div>
      )}

      {/* Items */}
      <nav style={{ flex: 1, padding: isCollapsed ? '0.75rem 0.6rem' : '0.35rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {menu.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={isActive(item.href)}
            hovered={hoveredItem === item.href}
            isCollapsed={isCollapsed}
            setHoveredItem={setHoveredItem}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Footer: Configuración + usuario */}
      <div style={{ borderTop: '1px solid var(--color-border-soft)', padding: isCollapsed ? '0.6rem 0.6rem' : '0.6rem 0.75rem', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <NavItem
          item={{ label: 'Configuración', icon: icons.config, href: '/admin/perfil' }}
          active={configActive}
          hovered={hoveredItem === '/admin/perfil'}
          isCollapsed={isCollapsed}
          setHoveredItem={setHoveredItem}
          onNavigate={onNavigate}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: isCollapsed ? '0.5rem 0' : '0.55rem 0.65rem',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            borderRadius: 10,
            marginTop: 2,
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--color-primary-soft)',
              color: 'var(--color-primary-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              flexShrink: 0,
            }}
          >
            {initials}
          </span>
          {!isCollapsed && (
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, minWidth: 0 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
                {displayName(user)}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{roleLabel(user)}</span>
            </span>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Item de navegación ─────────────────────────────────────────── */
function NavItem({ item, active, hovered, isCollapsed, setHoveredItem, onNavigate }) {
  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setHoveredItem(item.href)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      <a
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isCollapsed ? 0 : 12,
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          padding: isCollapsed ? '0.68rem' : '0.62rem 0.85rem',
          borderRadius: 11,
          textDecoration: 'none',
          transition: 'background 0.18s, color 0.18s',
          background: active ? 'var(--color-primary-soft)' : hovered ? 'var(--color-neutral-soft)' : 'transparent',
          color: active ? 'var(--color-primary-strong)' : 'var(--color-text-secondary)',
          fontWeight: active ? 600 : 500,
          fontSize: '0.9rem',
          position: 'relative',
        }}
      >
        {/* Acento izquierdo del activo */}
        {active && !isCollapsed && (
          <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: 3, background: 'var(--color-primary)' }} />
        )}
        <span
          style={{
            width: 20,
            height: 20,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: active ? 'var(--color-primary)' : hovered ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
            transition: 'color 0.18s',
          }}
        >
          {item.icon}
        </span>
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            maxWidth: isCollapsed ? 0 : 180,
            opacity: isCollapsed ? 0 : 1,
            transition: 'max-width 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s',
            letterSpacing: '-0.01em',
          }}
        >
          {item.label}
        </span>
      </a>

      {/* Tooltip en colapsado */}
      {isCollapsed && hovered && (
        <div className="hidden lg:block" style={{ position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 10, zIndex: 999, pointerEvents: 'none' }}>
          <div style={{ background: 'var(--color-text-primary)', color: '#fff', fontSize: '0.78rem', padding: '0.35rem 0.7rem', borderRadius: 7, whiteSpace: 'nowrap', boxShadow: 'var(--shadow-md)', position: 'relative' }}>
            {item.label}
            <span style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '5px solid var(--color-text-primary)' }} />
          </div>
        </div>
      )}
    </div>
  );
}
