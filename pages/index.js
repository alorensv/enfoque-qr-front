import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { login, user } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error de autenticación');
      login(data.user);
      setSuccess('¡Inicio de sesión exitoso!');
      router.push('/admin/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, redirect to /admin/home
  if (user) {
    if (typeof window !== 'undefined') {
      router.replace('/admin/home');
    }
    return null;
  }

  return (
    <>
      <Head>
        <title>Enfoque QR - Landing</title>
        <meta name="description" content="Landing page de Enfoque QR" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-teal-50 font-sans p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 sm:p-10 text-center">

          <div className="flex justify-center mb-6">
            <Logo theme="light" height={56} />
          </div>

          {/* Tagline */}
          <p className="text-slate-800 text-xl font-bold mb-1 tracking-tight">
            Gestiona equipos y documentos
            {' '}<span className="text-blue-600">sin fricción</span>.
          </p>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Una plataforma centralizada para escanear, registrar y mantener todo bajo control.
          </p>

          {/* Pills de beneficios */}
          <div className="flex flex-wrap justify-center gap-2 mb-7">
            {[
              {
                icon: (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
                  </svg>
                ),
                label: 'Documentos digitales',
              },
              {
                icon: (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/>
                    <rect x="3" y="16" width="5" height="5" rx="1"/><path d="M13 3v5M3 13h5M13 13h.01M13 16h.01M16 16h.01M19 13h.01M19 16h.01M19 19h.01M13 19h.01M16 19h.01"/>
                  </svg>
                ),
                label: 'QR instantáneo',
              },
              {
                icon: (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                ),
                label: 'Mantenciones al día',
              },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
              >
                {icon}
                {label}
              </span>
            ))}
          </div>
          <form id="login-form" className="flex flex-col gap-5 mb-4" onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              required
              autoComplete="username"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold text-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
            {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
            {success && <div className="text-green-600 text-sm mt-1">{success}</div>}
          </form>
          <a href="#" className="text-blue-600 text-sm hover:underline hover:text-blue-800 transition-colors">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </main>
    </>
  );
}
