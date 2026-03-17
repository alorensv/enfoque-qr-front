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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-teal-50 font-sans p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 sm:p-10 flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Iniciar sesión institución</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            placeholder="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
          />
          <input
            type="password"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            placeholder="Clave"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold text-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? 'Validando...' : 'Ingresar'}
          </button>
        </form>
        {error && <div className="text-red-600 text-sm text-center mt-1">{error}</div>}
      </div>
    </div>
  );
}
