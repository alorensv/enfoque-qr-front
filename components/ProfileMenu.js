import { useState, useRef, useEffect } from 'react';
import { displayName, initials as getInitials } from '../lib/user';

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

  const initials = getInitials(user);

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          gap: 8,
          padding: '0.25rem 0.6rem 0.25rem 0.3rem',
          borderRadius: 28,
          background: open ? 'var(--color-neutral-soft)' : 'transparent',
          border: '1px solid var(--color-border)',
          transition: 'background 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-neutral-soft)'}
        onMouseLeave={e => e.currentTarget.style.background = open ? 'var(--color-neutral-soft)' : 'transparent'}
      >
        {/* Avatar con iniciales */}
        <span style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--color-primary-soft)',
          color: 'var(--color-primary-strong)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.8rem',
          letterSpacing: 0.5,
          flexShrink: 0,
        }}>
          {initials}
        </span>
        <span className="hidden sm:block" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName(user)}
        </span>
        {/* Chevron down */}
        <svg
          style={{ width: 14, height: 14, color: 'var(--color-text-muted)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
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
