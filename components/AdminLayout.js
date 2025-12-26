import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <AdminHeader />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        <AdminSidebar />
        <main style={{ flex: 1, padding: '2rem 2.5rem', background: '#f8fafc' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
