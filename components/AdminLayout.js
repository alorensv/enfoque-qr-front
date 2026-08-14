import { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

/**
 * Layout del Panel Admin.
 *
 * Estructura: sidebar full-height a la izquierda + columna derecha con el
 * header (sobre el contenido) y el main scrollable. El sidebar se encarga de su
 * comportamiento sticky (desktop) y off-canvas (mobile).
 */
export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        background: 'var(--color-background)',
      }}
    >
      {/* Sidebar (sticky en desktop, off-canvas en mobile) */}
      <AdminSidebar
        isOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />

      {/* Columna derecha: header + contenido */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <AdminHeader toggleSidebar={() => setSidebarOpen((v) => !v)} />

        <main
          className="p-4 sm:p-6 lg:p-8"
          style={{
            flex: 1,
            minWidth: 0,
            overflowY: 'auto',
            background: 'var(--color-background)',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
