import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Logo from '../components/Logo';
import { authApi } from '../services/api';

export default function RecuperarPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      // Siempre se muestra éxito, exista o no el correo (el backend responde
      // igual en ambos casos para no revelar qué cuentas existen).
      setSent(true);
    } catch (err) {
      setError(err.message || 'Error al solicitar la recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Recuperar contraseña - Enfoque QR</title>
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[var(--color-primary-soft)] to-slate-50 font-sans p-4">
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 w-full max-w-md p-8 sm:p-10 text-center">
          <div className="flex justify-center mb-6">
            <Logo theme="light" height={56} />
          </div>

          <p className="text-slate-800 text-xl font-bold mb-1 tracking-tight">Recupera tu contraseña</p>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Ingresa el correo de tu cuenta y te enviaremos un link para crear una nueva contraseña.
          </p>

          {sent ? (
            <div className="text-left bg-[var(--color-primary-soft)] border border-[var(--color-primary-soft2)] rounded-lg p-4 text-sm text-slate-700">
              Si el correo existe en nuestro sistema, se envió un link de recuperación. Revisa tu bandeja de entrada (y spam) — el link vence en 60 minutos.
            </div>
          ) : (
            <form className="flex flex-col gap-5 mb-4" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Correo electrónico"
                required
                autoFocus
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft2)] transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-primary)] text-white px-4 py-3 rounded-lg font-semibold text-lg shadow-xs hover:bg-[var(--color-primary-hover)] active:translate-y-px focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperación'}
              </button>
              {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
            </form>
          )}

          <Link href="/" className="text-[var(--color-primary)] text-sm hover:underline hover:text-[var(--color-primary-hover)] transition-colors">
            Volver a iniciar sesión
          </Link>
        </div>
      </main>
    </>
  );
}
