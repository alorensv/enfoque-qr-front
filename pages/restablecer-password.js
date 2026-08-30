import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../components/Logo';
import { authApi } from '../services/api';

export default function RestablecerPassword() {
  const router = useRouter();
  const { token } = router.query;

  const [checking, setChecking] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    setChecking(true);
    authApi
      .validateResetToken(token)
      .then((data) => setValidToken(!!data.valid))
      .catch(() => setValidToken(false))
      .finally(() => setChecking(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  let content;
  if (checking) {
    content = <p className="text-slate-500 text-sm">Validando link...</p>;
  } else if (done) {
    content = (
      <>
        <div className="text-left bg-[var(--color-primary-soft)] border border-[var(--color-primary-soft2)] rounded-lg p-4 text-sm text-slate-700 mb-4">
          Tu contraseña fue actualizada correctamente.
        </div>
        <Link href="/" className="text-[var(--color-primary)] text-sm hover:underline hover:text-[var(--color-primary-hover)] transition-colors">
          Ir a iniciar sesión
        </Link>
      </>
    );
  } else if (!validToken) {
    content = (
      <>
        <div className="text-left bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
          Este link de recuperación es inválido o ya venció. Solicita uno nuevo.
        </div>
        <Link href="/recuperar-password" className="text-[var(--color-primary)] text-sm hover:underline hover:text-[var(--color-primary-hover)] transition-colors">
          Solicitar un nuevo link
        </Link>
      </>
    );
  } else {
    content = (
      <>
        <form className="flex flex-col gap-4 mb-4 text-left" onSubmit={handleSubmit}>
          <label className="text-sm font-semibold text-slate-700">Nueva contraseña
            <input
              type="password"
              required
              autoFocus
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft2)] transition-all mt-1"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">Confirmar contraseña
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-base outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft2)] transition-all mt-1"
            />
          </label>
          <p className="text-xs text-slate-500">
            Mínimo 12 caracteres. Evita contraseñas comunes o que contengan tu correo.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] text-white px-4 py-3 rounded-lg font-semibold text-lg shadow-xs hover:bg-[var(--color-primary-hover)] active:translate-y-px focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Guardando...' : 'Crear nueva contraseña'}
          </button>
          {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
        </form>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Restablecer contraseña - Enfoque QR</title>
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[var(--color-primary-soft)] to-slate-50 font-sans p-4">
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 w-full max-w-md p-8 sm:p-10 text-center">
          <div className="flex justify-center mb-6">
            <Logo theme="light" height={56} />
          </div>
          <p className="text-slate-800 text-xl font-bold mb-6 tracking-tight">Crear nueva contraseña</p>
          {content}
        </div>
      </main>
    </>
  );
}
