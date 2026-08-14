/**
 * Loader de pantalla completa con la marca de Enfoque QR.
 * Se usa mientras se valida la sesión (evita el "blanco" de withAuth).
 * Sigue el color primario del tema por dominio (variables CSS).
 */
export default function FullScreenLoader({ label = 'Cargando…' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        background: 'var(--color-background)',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        {/* Anillo giratorio */}
        <span
          className="animate-spin"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid var(--color-primary-soft2)',
            borderTopColor: 'var(--color-primary)',
          }}
          aria-hidden="true"
        />
        {/* Marca centrada */}
        <span
          style={{
            position: 'absolute',
            inset: 10,
            borderRadius: 13,
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-500) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
          aria-hidden="true"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <path d="M14 14h3M14 21h3M21 14v.01M21 17v4M17 17.5h.01" />
          </svg>
        </span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
          Enfoque QR
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
          {label}
          <span className="eq-dot">.</span>
          <span className="eq-dot">.</span>
          <span className="eq-dot">.</span>
        </div>
      </div>
    </div>
  );
}
