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
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (token && institutionId && role && userId) {
      setUser({ token, institutionId, role, userId });
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    // Decodificar el JWT para extraer institutionId, role y userId (sub)
    let institutionId = null;
    let role = null;
    let userId = null; 
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      institutionId = payload.institutionId;
      role = payload.role;
      userId = payload.userId || payload.sub || payload.id;
    } catch (e) {}
    if (!institutionId || !role || !userId) {
      // No permitir login si faltan datos
      console.log('Invalid token payload');
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('institutionId');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      return;
    }
    localStorage.setItem('token', token);
    localStorage.setItem('institutionId', institutionId);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    setUser({ token, institutionId, role, userId });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('institutionId');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
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
