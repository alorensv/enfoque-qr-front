import { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      background: '#f1f5f9',
    }}>
      {/* Header fijo en top */}
      <AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Fila: sidebar + contenido
          ⚠️ NO overflow:hidden aquí → permite el sticky del sidebar en desktop */}
      <div style={{ display: 'flex', flex: 1 }}>
        <AdminSidebar
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        {/* Main: scrollable, ocupa el espacio restante */}
        <main style={{
          flex: 1,
          minWidth: 0,
          overflowY: 'auto',
          padding: '2rem',
          // En mobile dejamos espacio para que el sidebar fijo no tape el content:
          // No es necesario margen porque el sidebar está off-canvas en mobile
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
