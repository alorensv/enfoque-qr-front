import Head from 'next/head';


import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

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
          <img src="/logo.png" alt="Enfoque QR Logo" className="w-20 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-blue-600 mb-4">Enfoque QR</h1>
          <p className="text-slate-700 text-lg mb-8 leading-relaxed">
            Solución moderna para gestión y escaneo de códigos QR.<br />
            Rápido, seguro y fácil de usar.
          </p>
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
