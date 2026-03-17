import ProfileMenu from './ProfileMenu';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function AdminHeader({ toggleSidebar }) {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleEditProfile = () => {
    router.push(`/admin/perfil`);
  };

  return (
    <header className="bg-blue-600 text-white px-4 sm:px-8 py-4 font-semibold text-xl tracking-wide flex items-center justify-between shadow-md z-10 relative">
      <div className="flex items-center gap-3 sm:gap-4">
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-2 -ml-2 bg-blue-700 hover:bg-blue-800 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Toggle Sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="truncate">Enfoque QR - Admin</span>
      </div>
      <ProfileMenu
        user={user}
        onLogout={logout}
        onEditProfile={handleEditProfile}
      />
    </header>
  );
}
