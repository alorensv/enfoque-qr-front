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

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          gap: 10,
          padding: '0.3rem 0.75rem 0.3rem 0.4rem',
          borderRadius: 28,
          background: open ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.2)',
          transition: 'background 0.2s, box-shadow 0.2s',
          boxShadow: open ? '0 0 0 2px rgba(255,255,255,0.25)' : 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = open ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}
      >
        {/* Avatar con iniciales */}
        <span style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.8rem',
          letterSpacing: 0.5,
          flexShrink: 0,
          color: '#fff',
        }}>
          {initials}
        </span>
        <span style={{ fontWeight: 500, fontSize: '0.95rem', letterSpacing: 0.2 }}>
          {user?.name || 'Usuario'}
        </span>
        {/* Chevron down */}
        <svg
          style={{ width: 14, height: 14, opacity: 0.8, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
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
