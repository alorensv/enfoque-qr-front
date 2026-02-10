import { useRouter } from 'next/router';
import { useState } from 'react';
import Cookies from 'js-cookie';

export default function QrLogin() {
  const router = useRouter();
  const { token } = router.query;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Usuario o clave incorrectos');
      // Token ya está en cookie httpOnly
      Cookies.set('institucion_session', 'ok', { expires: 1 });
      router.replace(`/qr/${token}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-4 px-2">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4">
        <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">Iniciar sesión institución</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="text"
            className="border rounded px-3 py-2 text-sm"
            placeholder="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
          />
          <input
            type="password"
            className="border rounded px-3 py-2 text-sm"
            placeholder="Clave"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Validando...' : 'Ingresar'}
          </button>
        </form>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      </div>
    </div>
  );
}
