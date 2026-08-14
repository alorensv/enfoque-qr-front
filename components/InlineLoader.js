/**
 * Loader en página (dentro de una card/sección). Spinner que gira de verdad
 * (animate-spin) + etiqueta con puntos animados. Sigue el color del tema.
 */
export default function InlineLoader({ label = 'Cargando', py = 'py-24' }) {
  return (
    <div className={`flex flex-col items-center justify-center ${py}`} role="status" aria-live="polite">
      <span
        className="animate-spin"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid var(--color-primary-soft2)',
          borderTopColor: 'var(--color-primary)',
          marginBottom: 16,
        }}
        aria-hidden="true"
      />
      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
        {label}
        <span className="eq-dot">.</span>
        <span className="eq-dot">.</span>
        <span className="eq-dot">.</span>
      </span>
    </div>
  );
}
