import { useState, useRef, useEffect } from 'react';

export default function ProfileMenu({ onLogout, onEditProfile, user }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          gap: 8,
          padding: '0.25rem 0.5rem',
          borderRadius: 24,
          background: open ? 'rgba(255,255,255,0.08)' : 'transparent',
          transition: 'background 0.2s',
        }}
      >
        <img
          src={user?.photoUrl || '/profile-default.png'}
          alt="profile"
          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }}
        />
        <span style={{ fontWeight: 500 }}>{user?.name || 'Usuario'}</span>
        <span style={{ fontSize: 24, marginLeft: 4 }}>&#9776;</span>
      </div>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '110%',
            background: '#fff',
            color: '#222',
            borderRadius: 8,
            boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
            minWidth: 160,
            zIndex: 10,
            padding: '0.5rem 0',
          }}
        >
          <button
            onClick={onEditProfile}
            style={{
              background: 'none',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              color: '#2563eb',
              fontWeight: 500,
            }}
          >
            Editar perfil
          </button>
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              color: '#dc2626',
              fontWeight: 500,
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
