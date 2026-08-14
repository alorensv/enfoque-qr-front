import Link from 'next/link';

/**
 * Próximos pasos (action-oriented). Cada paso es un link a la acción concreta.
 * Recibe `steps: [{ label, href, done }]`. Usa el color primario del tema.
 */
export default function NextStepsCard({ steps = [] }) {
  return (
    <div className="rounded-2xl p-6 border border-[var(--color-primary-soft2)] bg-[var(--color-primary-soft)]">
      <h3 className="font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-strong)]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Próximos pasos
      </h3>
      <ul className="space-y-2.5">
        {steps.map((step, idx) => (
          <li key={idx}>
            <Link
              href={step.href}
              className="group flex items-start gap-2.5 rounded-lg px-2 py-1.5 -mx-2 hover:bg-[var(--color-primary-soft2)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              <span className="mt-0.5 shrink-0 text-[var(--color-primary)]" style={{ opacity: step.done ? 1 : 0.55 }}>
                {step.done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /></svg>
                )}
              </span>
              <span
                className="text-sm font-medium text-[var(--color-primary-strong)]"
                style={step.done ? { textDecoration: 'line-through', opacity: 0.6 } : undefined}
              >
                {step.label}
              </span>
              <svg className="w-3.5 h-3.5 ml-auto mt-0.5 shrink-0 text-[var(--color-primary-soft2)] group-hover:text-[var(--color-primary)] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
