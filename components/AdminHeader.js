import ProfileMenu from './ProfileMenu';
import { useAuth } from '../contexts/AuthContext';

export default function AdminHeader() {
  const { logout, user } = useAuth();

  const handleEditProfile = () => {
    // Aquí puedes abrir un modal o redirigir a la página de perfil
    alert('Funcionalidad de edición de perfil próximamente');
  };

  return (
    <header style={{
      background: '#2563eb',
      color: '#fff',
      padding: '1rem 2rem',
      fontWeight: 600,
      fontSize: '1.2rem',
      letterSpacing: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(37,99,235,0.08)'
    }}>
      <span>Enfoque QR - Admin</span>
      <ProfileMenu
        user={user}
        onLogout={logout}
        onEditProfile={handleEditProfile}
      />
    </header>
  );
}
