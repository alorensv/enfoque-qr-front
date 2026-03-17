import ProfileMenu from './ProfileMenu';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from './Logo';

export default function AdminHeader({ toggleSidebar }) {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleEditProfile = () => {
    router.push(`/admin/perfil`);
  };

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <header
        style={{
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)',
          boxShadow: '0 2px 12px rgba(30,64,175,0.35)',
        }}
        className="text-white px-4 sm:px-8 py-3.5 flex items-center justify-between z-10 relative"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 -ml-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            aria-label="Toggle Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Logo theme="dark" height={36} />
        </div>
        <ProfileMenu
          user={user}
          onLogout={logout}
          onEditProfile={handleEditProfile}
        />
      </header>
    </>
  );
}
