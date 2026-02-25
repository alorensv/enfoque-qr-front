import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import EquipmentForm from '../../../components/EquipmentForm';
import { qrApi } from '../../../services/api';

export default function EnrollEquipment() {
  const router = useRouter();
  const { token } = router.query;
  const [qrToken, setQrToken] = useState('');
  const [qrValidated, setQrValidated] = useState(false);
  const [validating, setValidating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState([]);
  const [availableQRs, setAvailableQRs] = useState([]);
  const [loadingQRs, setLoadingQRs] = useState(false);
  const [showQRList, setShowQRList] = useState(false);
  const [searchQR, setSearchQR] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInstitutions();
    fetchAvailableQRs();
    // Si viene un token en la URL, pre-llenarlo
    if (token) {
      setQrToken(token);
    }
  }, [token]);

  const fetchInstitutions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/institutions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error('Error al cargar instituciones:', response.status);
        setInstitutions([]);
        return;
      }
      
      const data = await response.json();
      // Asegurar que data sea un array
      setInstitutions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar instituciones:', err);
      setInstitutions([]);
    }
  };

  const fetchAvailableQRs = async () => {
    setLoadingQRs(true);
    try {
      const data = await qrApi.getAvailable(1, 100, searchQR);
      setAvailableQRs(data.data || []);
    } catch (err) {
      console.error('Error al cargar códigos QR:', err);
    } finally {
      setLoadingQRs(false);
    }
  };

  const handleSelectQR = (selectedToken) => {
    setQrToken(selectedToken);
    setShowQRList(false);
    setQrValidated(false);
  };

  const handleSearchQR = async (e) => {
    e.preventDefault();
    fetchAvailableQRs();
  };

  const handleValidateQR = async () => {
    if (!qrToken.trim()) {
      alert('Ingrese un código QR');
      return;
    }

    setValidating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/qr/validate/${qrToken}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (data.valid) {
        setQrValidated(true);
        alert('Código QR válido y disponible');
      } else {
        alert(data.message || 'Código QR no válido');
        setQrValidated(false);
      }
    } catch (err) {
      alert('Error al validar código QR');
      setQrValidated(false);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async ({ formData, equipmentPhoto }) => {
    setError(null);
    
    if (!formData.name.trim()) {
      setError('El nombre del equipo es obligatorio');
      return;
    }

    if (!formData.status) {
      setError('El estado del equipo es obligatorio');
      return;
    }

    if (!formData.institutionId) {
      setError('Debe seleccionar una institución');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Crear FormData para enviar archivo de foto
      const data = new FormData();
      data.append('qr_token', qrToken);
      data.append('name', formData.name);
      data.append('serialNumber', formData.serialNumber);
      data.append('status', formData.status);
      data.append('description', formData.description || '');
      data.append('institutionId', formData.institutionId);
      
      if (equipmentPhoto) {
        data.append('equipmentPhoto', equipmentPhoto);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/equipments/enroll`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: data,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al enrolar equipo');
      }

      const result = await response.json();
      alert('Equipo enrolado exitosamente');
      router.push('/admin/equipos');
    } catch (err) {
      setError('Error al enrolar equipo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enrolar Nuevo Equipo</h1>
          <p className="mt-2 text-gray-600">
            Asocia un código QR pre-generado a un nuevo equipo
          </p>
        </div>

        {/* Paso 1: Capturar código QR */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Paso 1: Capturar código QR
          </h2>

          <div className="flex gap-4">
            <input
              type="text"
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              placeholder="Ingrese el código QR"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={qrValidated}
            />
            <button
              onClick={handleValidateQR}
              disabled={qrValidated || validating}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
            >
              {validating ? 'Validando...' : 'Validar'}
            </button>
          </div>

          {qrValidated && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">✓ Código QR válido y disponible</p>
              <p className="text-sm text-green-600 font-mono mt-1">{qrToken}</p>
            </div>
          )}

          {/* Acordeón de códigos QR disponibles */}
          {!qrValidated && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowQRList(!showQRList)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-md transition-colors"
              >
                <span className="font-medium text-gray-700">
                  {showQRList ? '▼' : '▶'} Ver códigos QR disponibles
                </span>
                <span className="text-sm text-gray-500">
                  {availableQRs.length} disponibles
                </span>
              </button>

              {showQRList && (
                <div className="mt-3 border border-gray-200 rounded-md bg-white">
                  {/* Buscador */}
                  <div className="p-4 border-b border-gray-200">
                    <form onSubmit={handleSearchQR} className="flex gap-2">
                      <input
                        type="text"
                        value={searchQR}
                        onChange={(e) => setSearchQR(e.target.value)}
                        placeholder="Buscar código QR..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                      >
                        Buscar
                      </button>
                    </form>
                  </div>

                  {/* Lista de códigos QR */}
                  <div className="max-h-80 overflow-y-auto">
                    {loadingQRs ? (
                      <div className="p-8 text-center text-gray-500">
                        Cargando códigos QR...
                      </div>
                    ) : availableQRs.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        No hay códigos QR disponibles
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {availableQRs.map((qr) => (
                          <button
                            key={qr.id}
                            type="button"
                            onClick={() => handleSelectQR(qr.token)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-mono text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                  {qr.token}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Creado: {new Date(qr.created_at).toLocaleDateString('es-CL')}
                                </p>
                              </div>
                              <svg
                                className="w-5 h-5 text-gray-400 group-hover:text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Paso 2: Datos del equipo */}
        {qrValidated && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Paso 2: Datos del equipo
            </h2>
            
            <EquipmentForm
              onSubmit={handleSubmit}
              onCancel={() => router.push('/admin/equipos')}
              submitLabel="Enrolar Equipo"
              loading={loading}
              showPhotoUpload={true}
              showInstitution={true}
              institutions={institutions}
              error={error}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
