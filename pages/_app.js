import '../styles/globals.css';
import { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { applyTheme, resolveThemeKey } from '../lib/theme';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Reafirma el tema por dominio tras la hidratación (el FOUC lo evita el
    // script de _document; esto lo mantiene consistente en navegación SPA).
    applyTheme(resolveThemeKey(window.location.hostname));
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
