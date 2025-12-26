const menu = [
  { label: 'Dashboard', icon: '🏠', href: '/admin/home' },
  { label: 'Usuarios', icon: '👤', href: '/admin/usuarios' },
  { label: 'Equipos', icon: '🖥️', href: '/admin/equipos' },
  { label: 'Documentos', icon: '📄', href: '/admin/documentos' },
  { label: 'Mantenciones', icon: '🛠️', href: '/admin/mantenciones' },
];

export default function AdminSidebar() {
  return (
    <aside style={{
      width: 220,
      background: '#f1f5f9',
      height: '100vh',
      padding: '2rem 0.5rem',
      boxSizing: 'border-box',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {menu.map(item => (
        <a key={item.href} href={item.href} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0.75rem 1rem',
          borderRadius: 8,
          color: '#334155',
          textDecoration: 'none',
          fontWeight: 500,
          fontSize: '1.05rem',
          transition: 'background 0.18s',
        }}
        onMouseOver={e => e.currentTarget.style.background = '#e0e7ff'}
        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <span>{item.icon}</span> {item.label}
        </a>
      ))}
    </aside>
  );
}
