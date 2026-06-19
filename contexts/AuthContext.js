import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ── Interceptor global de fetch ──
  // Ante un 401 de la API, intenta renovar la sesión con /auth/refresh y
  // reintenta la petición original una sola vez. El reintento usa el fetch
  // original (no el interceptado) para evitar bucles.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const rawFetch = window.fetch.bind(window);
    let refreshing = null;

    window.fetch = async (input, init = {}) => {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      const isApi = !!API_URL && url.startsWith(API_URL);
      const isAuthFlow =
        url.includes('/auth/refresh') ||
        url.includes('/auth/login') ||
        url.includes('/auth/logout');

      let res = await rawFetch(input, init);

      if (res.status === 401 && isApi && !isAuthFlow) {
        if (!refreshing) {
          refreshing = rawFetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          })
            .then((r) => r.ok)
            .catch(() => false);
        }
        const ok = await refreshing;
        refreshing = null;
        if (ok) {
          res = await rawFetch(input, init);
        }
      }

      // Reintento único ante 5xx transitorios en GET (p. ej. "Connection lost"
      // de MySQL): no afecta a mutaciones (solo GET, que es idempotente).
      if (isApi && !isAuthFlow && [500, 502, 503, 504].includes(res.status)) {
        const method = (init.method || (typeof input !== 'string' && input?.method) || 'GET').toUpperCase();
        if (method === 'GET') {
          await new Promise((r) => setTimeout(r, 500));
          try {
            const retry = await rawFetch(input, init);
            if (retry.ok) res = retry;
          } catch {
            /* se mantiene la respuesta original */
          }
        }
      }

      return res;
    };

    return () => {
      window.fetch = rawFetch;
    };
  }, []);

  // ── Verificación inicial de sesión ──
  // Usa el fetch ya interceptado, así que si el access token expiró se
  // renueva automáticamente antes de decidir si hay sesión.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
        setUser(res.ok ? await res.json() : null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // ── Refresco proactivo ──
  // Renueva el access token periódicamente mientras hay sesión, para que las
  // peticiones (incluidas las que no pasan por el interceptor) no caduquen.
  useEffect(() => {
    if (!user) return undefined;
    const id = setInterval(() => {
      fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' }).catch(
        () => undefined,
      );
    }, 20 * 60 * 1000); // 20 min (access token dura 30 min)
    return () => clearInterval(id);
  }, [user]);

  const login = async (userData) => {
    // Los tokens ya están en cookies httpOnly (access + refresh)
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error al hacer logout:', error);
    }
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
