import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export default function QrPage() {
  const router = useRouter();
  const { token } = router.query;
  const [qr, setQr] = useState(null);
  const [equipo, setEquipo] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [puedeVerPrivados, setPuedeVerPrivados] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [mantenciones, setMantenciones] = useState([]);
  const [lastMaintenance, setLastMaintenance] = useState(null);

  // Check login status on mount
  useEffect(() => {
    const session = Cookies.get('institucion_session');
    if (session) {
      setIsLoggedIn(true);
      setPuedeVerPrivados(true);
    } else {
      setIsLoggedIn(false);
      setPuedeVerPrivados(false);
    }
  }, []);

  // Controlar si mostrar el login embebido
  const [showLogin, setShowLogin] = useState(false);

  // Cargar QR y datos de equipo relacionados
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    let equipoId = null;
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/qr/${token}`)
        .then(res => {
          if (!res.ok) throw new Error('QR no encontrado');
          return res.json();
        }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/equipments/by-qr/${token}`)
        .then(res => res.ok ? res.json() : null)
    ])
      .then(async ([qrData, equipoData]) => {
        setQr(qrData);
        setEquipo(equipoData);
        setEditData(equipoData ? { ...equipoData } : null);
        if (equipoData && equipoData.id) {
          equipoId = equipoData.id;
          // Obtener documentos reales
          const docsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/equipments/${equipoId}/documents`);
          if (docsRes.ok) {
            const docs = await docsRes.json();
            setDocumentos(docs);
          } else {
            setDocumentos([]);
          }
          // Obtener mantenciones reales
          const mantRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/maintenances/equipment/${equipoId}`);
          if (mantRes.ok) {
            const mants = await mantRes.json();
            setMantenciones(mants);
            if (mants.length > 0) {
              // Asumimos que las mantenciones vienen ordenadas por fecha descendente desde el API
              setLastMaintenance(mants[0]);
            }
          } else {
            setMantenciones([]);
          }
        } else {
          setDocumentos([]);
          setMantenciones([]);
        }
      })
      .catch(() => setError('QR no encontrado'))
      .finally(() => setLoading(false));
  }, [token]);


  // Logout function
  const handleLogout = () => {
    Cookies.remove('institucion_session');
    setIsLoggedIn(false);
    setPuedeVerPrivados(false);
    router.replace(`/qr/${token}`);
  };

  // Marcar documento como inactivo (soft delete)
  const marcarDocumentoInactivo = async (docId) => {
    if (!window.confirm('¿Seguro que deseas marcar este documento como inactivo?')) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/equipments/documents/${docId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDocumentos(prev => prev.filter(d => d.id !== docId));
        setSaveMsg('Documento marcado como inactivo');
      } else {
        setSaveMsg('Error al marcar documento');
      }
    } catch {
      setSaveMsg('Error al marcar documento');
    }
    setSaving(false);
  };

  // Simulación de guardar cambios (reemplazar por API real)
  const guardarCambios = async () => {
    setSaving(true);
    setSaveMsg(null);
    setTimeout(() => {
      setSaving(false);
      setSaveMsg('Cambios guardados correctamente');
    }, 1200);
  };


  if (loading) return <div className="p-8 text-center text-gray-500">Cargando información...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!qr) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-grow">
            <h1 className="text-2xl font-bold text-gray-800">{equipo?.name || 'Equipo sin nombre'}</h1>
            <p className="text-sm text-gray-500">{equipo?.description}</p>
            <span className={`mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full ${
              equipo?.status === 'activo' ? 'bg-green-100 text-green-800' : 
              equipo?.status === 'inactivo' ? 'bg-gray-200 text-gray-600' : 
              'bg-yellow-100 text-yellow-800'
            }`}>{equipo?.status || 'sin estado'}</span>
          </div>
          {equipo?.equipmentPhoto && (
            <img 
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/public${equipo.equipmentPhoto}`} 
              alt="Foto del equipo" 
              className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200" 
            />
          )}
        </div>

        {/* Última Mantención */}
        {lastMaintenance && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-bold text-blue-900 mb-2">Última Mantención</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-600">Fecha</p>
                <p className="text-gray-800">{new Date(lastMaintenance.performedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600">Estado</p>
                <p className="text-gray-800">{lastMaintenance.status}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600">Responsable</p>
                <p className="text-gray-800">{lastMaintenance.user?.userProfile?.fullName || lastMaintenance.technician || 'No asignado'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Detalles del Equipo */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Detalles del Equipo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-gray-500">N/S:</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">{equipo?.serialNumber || '-'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">Creado:</span>
              <span className="text-gray-800">{equipo?.createdAt ? new Date(equipo.createdAt).toLocaleDateString() : '-'}</span>
            </div>
          </div>
        </div>

        {/* Documentación */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Documentación</h2>
          <ul className="space-y-2">
            {documentos.filter(doc => puedeVerPrivados || !doc.isPrivate).length === 0 ? (
              <li className="text-gray-500 text-sm italic">No hay documentos disponibles.</li>
            ) : (
              documentos
                .filter(doc => puedeVerPrivados || !doc.isPrivate)
                .map(doc => (
                  <li key={doc.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between gap-4 transition hover:bg-gray-100">
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900">
                        {doc.name}
                        {doc.isPrivate && <span className="ml-2 text-xs font-bold text-red-600">(Privado)</span>}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}
                        {doc.responsable ? ` · ${doc.responsable}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {doc.filePath && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/equipments/documents/${doc.id}/download`}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          Descargar
                        </a>
                      )}
                      {puedeVerPrivados && (
                        <button
                          title="Marcar como inactivo"
                          className="text-red-500 hover:text-red-700 text-xl font-bold"
                          onClick={() => marcarDocumentoInactivo(doc.id)}
                          disabled={saving}
                          aria-label="Marcar como inactivo"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  </li>
                ))
            )}
          </ul>
        </div>

        {/* Mantenciones */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">Historial de Mantenciones</h2>
            {puedeVerPrivados && (
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-4 py-2 text-sm shadow-sm transition flex items-center gap-2"
                onClick={() => router.push(`/qr/${token}/maintenances/nuevo`)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Nueva
              </button>
            )}
          </div>
          <ul className="space-y-2">
            {mantenciones.length === 0 ? (
              <li className="text-gray-500 text-sm italic">No hay mantenciones registradas.</li>
            ) : (
              mantenciones.map(mant => (
                <li key={mant.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {new Date(mant.performedAt).toLocaleDateString()} - <span className="font-normal">{mant.status}</span>
                    </p>
                    <p className="text-xs text-gray-600">
                      Resp: {mant.user?.userProfile?.fullName || mant.technician || 'No asignado'}
                    </p>
                  </div>
                  <button
                    className="text-blue-600 hover:underline font-medium"
                    onClick={() => router.push(`/qr/${token}/maintenances/detail?id=${mant.id}`)}
                  >
                    Ver Detalles
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Footer y Acciones */}
        <div className="border-t pt-6 text-center">
          {isLoggedIn ? (
            <button
              className="w-full max-w-xs mx-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm transition"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              ¿Eres administrador?{' '}
              <button
                className="text-blue-600 hover:underline font-semibold"
                onClick={() => router.push(`/qr/login?token=${token}`)}
              >
                Inicia sesión aquí
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
