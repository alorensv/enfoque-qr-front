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
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error de autenticación');
      login(data.access_token);
      setSuccess('¡Inicio de sesión exitoso!');
      console.log("Logged in with token:");
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
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '1rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          padding: '3rem 2rem',
          maxWidth: 420,
          textAlign: 'center',
        }}>
          <img src="/logo.png" alt="Enfoque QR Logo" style={{ width: 80, marginBottom: 24 }} />
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', color: '#2563eb' }}>Enfoque QR</h1>
          <p style={{ color: '#334155', fontSize: '1.1rem', marginBottom: 32 }}>
            Solución moderna para gestión y escaneo de códigos QR.<br />
            Rápido, seguro y fácil de usar.
          </p>
          <form id="login-form" style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 16 }} onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              required
              autoComplete="username"
              style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={e => e.currentTarget.style.border = '1.5px solid #2563eb'}
              onBlur={e => e.currentTarget.style.border = '1px solid #cbd5e1'}
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              required
              autoComplete="current-password"
              style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={e => e.currentTarget.style.border = '1.5px solid #2563eb'}
              onBlur={e => e.currentTarget.style.border = '1px solid #cbd5e1'}
            />
            <button
              type="submit"
              style={{
                background: '#2563eb',
                color: '#fff',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#1d4ed8'}
              onMouseOut={e => e.currentTarget.style.background = '#2563eb'}
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
            {error && <div style={{ color: '#dc2626', fontSize: '0.98rem', marginTop: 4 }}>{error}</div>}
            {success && <div style={{ color: '#16a34a', fontSize: '0.98rem', marginTop: 4 }}>{success}</div>}
          </form>
          <a href="#" style={{
            color: '#2563eb',
            fontSize: '0.95rem',
            textDecoration: 'underline',
            marginBottom: 8,
          }}>
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </main>
    </>
  );
}
