import { useState } from 'react';
import { useRouter } from 'next/router';

/* ─── Íconos SVG inline ──────────────────────────────────────────── */
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
  chevronLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
};

/* ─── Definición del menú ────────────────────────────────────────── */
const menu = [
  { label: 'Dashboard',    icon: icons.dashboard,    href: '/admin/home' },
  { label: 'Usuarios',     icon: icons.usuarios,     href: '/admin/usuarios' },
  { label: 'Clientes',     icon: icons.clientes,     href: '/admin/clientes' },
  { label: 'Equipos',      icon: icons.equipos,      href: '/admin/equipos' },
  { label: 'Documentos',   icon: icons.documentos,   href: '/admin/documents' },
  { label: 'Mantenciones', icon: icons.mantenciones, href: '/admin/mantenciones' },
  { label: 'QR Universal', icon: icons.qr,           href: '/admin/qr-universal' },
];

/* ─── Estilos compartidos del sidebar ───────────────────────────── */
const sidebarBase = {
  display: 'flex',
  flexDirection: 'column',
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  background: 'linear-gradient(175deg, #0f172a 0%, #1e293b 100%)',
  borderRight: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '4px 0 32px rgba(0,0,0,0.35)',
  overflowX: 'hidden',
  overflowY: 'auto',
  zIndex: 50,
};

import { useAuth } from '../contexts/AuthContext';

export default function AdminSidebar({ isOpen, closeSidebar }) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const router = useRouter();

  const isActive = (href) =>
    router.pathname === href || router.pathname.startsWith(href + '/');

  const sidebarWidth = isCollapsed ? 68 : 240;

  // Filtrar menú según rol
  const filteredMenu = menu.filter(item => {
    if (user?.role === 'institution_user') {
      // Usuarios normales NO ven Usuarios ni Clientes
      return !['Usuarios', 'Clientes'].includes(item.label);
    }
    return true;
  });

  return (
    <>
      {/* ── Overlay mobile (solo aparece en mobile cuando está abierto) ── */}
      <div
        onClick={closeSidebar}
        className="lg:hidden"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(2px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s',
        }}
        aria-hidden="true"
      />

      {/* ── MOBILE: sidebar fixed off-canvas ───────────────────────────── */}
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
        }}
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          menu={filteredMenu}
          isActive={isActive}
          icons={icons}
        />
      </aside>

      {/* ── DESKTOP: sidebar sticky en el flujo del documento ──────────── */}
      {/* Este aside SÍ ocupa espacio en el flex row → main va al costado */}
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
        <SidebarContent
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          menu={filteredMenu}
          isActive={isActive}
          icons={icons}
        />
      </aside>
    </>
  );
}

/* ─── Contenido interno del sidebar (compartido entre mobile/desktop) ─ */
function SidebarContent({ isCollapsed, setIsCollapsed, hoveredItem, setHoveredItem, menu, isActive, icons }) {
  return (
    <>
      {/* ── Branding strip ──────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        padding: isCollapsed ? '1rem 0' : '1rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        minHeight: 60,
        flexShrink: 0,
      }}>
        {!isCollapsed && (
          <span style={{
            fontWeight: 800,
            fontSize: '0.85rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            background: 'linear-gradient(90deg, #60a5fa, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            whiteSpace: 'nowrap',
          }}>
            Panel Admin
          </span>
        )}

        {/* Botón colapsar */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: '#94a3b8',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.color = '#e2e8f0';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <span style={{
            display: 'flex',
            width: 16,
            height: 16,
            transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
          }}>
            {icons.chevronLeft}
          </span>
        </button>
      </div>

      {/* ── Etiqueta de sección ──────────────────────── */}
      {!isCollapsed && (
        <div style={{
          padding: '1rem 1.25rem 0.4rem',
          color: '#475569',
          fontSize: '0.68rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 600,
          flexShrink: 0,
        }}>
          Navegación
        </div>
      )}

      {/* ── Items del menú ───────────────────────────── */}
      <nav style={{
        flex: 1,
        padding: isCollapsed ? '0.75rem 0.5rem' : '0.5rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflowY: 'auto',
      }}>
        {menu.map((item) => {
          const active = isActive(item.href);
          const hovered = hoveredItem === item.href;

          return (
            <div
              key={item.href}
              style={{ position: 'relative' }}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <a
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isCollapsed ? 0 : 12,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  padding: isCollapsed ? '0.7rem' : '0.65rem 0.9rem',
                  borderRadius: 10,
                  textDecoration: 'none',
                  transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
                  background: active
                    ? 'linear-gradient(90deg, rgba(59,130,246,0.22) 0%, rgba(99,102,241,0.15) 100%)'
                    : hovered
                      ? 'rgba(255,255,255,0.06)'
                      : 'transparent',
                  color: active ? '#93c5fd' : hovered ? '#cbd5e1' : '#94a3b8',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.9rem',
                  boxShadow: active ? 'inset 3px 0 0 #3b82f6' : 'none',
                }}
              >
                {/* Ícono */}
                <span style={{
                  width: 20,
                  height: 20,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: active ? '#60a5fa' : hovered ? '#cbd5e1' : '#94a3b8',
                  transition: 'color 0.18s',
                }}>
                  {item.icon}
                </span>

                {/* Label con animación al colapsar */}
                <span style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  maxWidth: isCollapsed ? 0 : 180,
                  opacity: isCollapsed ? 0 : 1,
                  transition: 'max-width 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s',
                  letterSpacing: '-0.01em',
                }}>
                  {item.label}
                </span>

                {/* Punto indicador activo */}
                {active && !isCollapsed && (
                  <span style={{
                    marginLeft: 'auto',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#3b82f6',
                    flexShrink: 0,
                    boxShadow: '0 0 6px #3b82f6',
                  }} />
                )}
              </a>

              {/* Tooltip en modo colapsado (controlado por estado, sin CSS selector) */}
              {isCollapsed && hovered && (
                <div
                  className="hidden lg:block"
                  style={{
                    position: 'absolute',
                    left: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    marginLeft: 10,
                    zIndex: 999,
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{
                    background: '#1e293b',
                    color: '#e2e8f0',
                    fontSize: '0.8rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 7,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    position: 'relative',
                  }}>
                    {item.label}
                    <span style={{
                      position: 'absolute',
                      right: '100%',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      borderTop: '5px solid transparent',
                      borderBottom: '5px solid transparent',
                      borderRight: '5px solid #1e293b',
                    }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Footer ───────────────────────────────────── */}
      <div style={{
        padding: isCollapsed ? '0.75rem 0.5rem' : '0.75rem 1.25rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: 10,
        flexShrink: 0,
      }}>
        <span style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#22c55e',
          boxShadow: '0 0 6px #22c55e',
          flexShrink: 0,
        }} />
        {!isCollapsed && (
          <span style={{ fontSize: '0.75rem', color: '#475569', letterSpacing: '-0.01em' }}>
            Sistema activo
          </span>
        )}
      </div>
    </>
  );
}
