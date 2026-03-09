import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function UniversalQRSearchByInstitution() {
  const router = useRouter();
  const { institutionSlug } = router.query;
  const [institutionName, setInstitutionName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingInstitution, setLoadingInstitution] = useState(true);
  const [error, setError] = useState('');

  // Cargar información de la institución
  useEffect(() => {
    if (!institutionSlug) return;
    
    const fetchInstitution = async () => {
      try {
        const response = await fetch(`${API_URL}/institutions/by-slug/${institutionSlug}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.name) {
            setInstitutionName(data.name);
            // Obtener logo de settings si existe
            if (data.settings && data.settings.logo_url) {
              setLogoUrl(data.settings.logo_url);
            }
          }
        } else {
          setError('Institución no encontrada');
        }
      } catch (err) {
        console.error('Error al cargar institución:', err);
        setError('Error al cargar información de la institución');
      } finally {
        setLoadingInstitution(false);
      }
    };

    fetchInstitution();
  }, [institutionSlug]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/equipments/search-by-serial/${institutionSlug}/${serialNumber.trim()}`
      );
      
      const data = await response.json();
      
      if (response.ok && data.success && data.equipment) {
        // Obtener el primer QR activo
        const qrCodes = data.equipment.qrCodes;
        if (qrCodes && qrCodes.length > 0) {
          const token = qrCodes[0].token;
          // Redirigir a la tarjeta QR estándar del equipo
          router.push(`/qr/${token}`);
        } else {
          setError('Equipo encontrado pero no tiene código QR asignado');
        }
      } else if (response.status === 404) {
        setError(data.message || `No se encontró un equipo con ese número de serie en ${institutionName}`);
      } else if (response.status === 429) {
        setError('Demasiadas búsquedas. Por favor, espera un momento.');
      } else {
        setError(data.message || 'Error al buscar el equipo. Intenta nuevamente.');
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('Error al buscar el equipo. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingInstitution) {
    return (
      <>
        <Head>
          <title>Cargando... | EnfoqueQR</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-gray-600">Cargando...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`Búsqueda de Equipos - ${institutionName || 'EnfoqueQR'}`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          
          {/* Logo e institución */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Búsqueda de Equipos
            </h1>
            {logoUrl && (
              <div className="flex justify-center mb-4">
                <img 
                  src={logoUrl.startsWith('http') ? logoUrl : `${API_URL}${logoUrl}`} 
                  alt={institutionName} 
                  className="h-16 object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
            {institutionName && (
              <p className="text-blue-600 text-sm font-semibold mb-4">
                📍 {institutionName}
              </p>
            )}
            <p className="text-gray-600 text-sm">
              Ingresa el número de serie del equipo
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label 
                htmlFor="serial" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Número de Serie
              </label>
              <input
                id="serial"
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Ej: SN-2024-001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !serialNumber.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Buscando...' : 'Buscar Equipo'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              🔍 Búsqueda limitada a equipos de {institutionName || 'esta institución'}
            </p>
            <p className="text-xs text-gray-400 text-center mt-2">
              El número de serie se encuentra en la placa del equipo
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
