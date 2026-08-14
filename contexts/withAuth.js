import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './AuthContext';
import FullScreenLoader from '../components/FullScreenLoader';

export default function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace('/');
      }
    }, [user, loading, router]);

    // Mientras se valida la sesión (o mientras se redirige al login si expiró),
    // mostrar un loader con la marca en vez de una pantalla en blanco.
    if (loading) return <FullScreenLoader label="Verificando sesión" />;
    if (!user) return <FullScreenLoader label="Redirigiendo al inicio" />;

    return <Component {...props} />;
  };
}
