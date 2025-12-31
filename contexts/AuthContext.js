import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for token and user info in localStorage on mount
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const institutionId = typeof window !== 'undefined' ? localStorage.getItem('institutionId') : null;
    const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
    if (token && institutionId && role) {
      setUser({ token, institutionId, role });
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    // Decodificar el JWT para extraer institutionId y role
    let institutionId = null;
    let role = null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      institutionId = payload.institutionId;
      role = payload.role;
    } catch (e) {}
    if (!institutionId || !role) {
      // No permitir login si faltan datos
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('institutionId');
      localStorage.removeItem('role');
      return;
    }
    localStorage.setItem('token', token);
    localStorage.setItem('institutionId', institutionId);
    localStorage.setItem('role', role);
    setUser({ token, institutionId, role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('institutionId');
    localStorage.removeItem('role');
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
