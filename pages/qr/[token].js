
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
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-4 px-2">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-4 md:p-8 flex flex-col gap-4">
        {/* Header equipo */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b pb-2">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              {equipo?.name || 'Equipo'}
              {equipo?.status && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${equipo.status === 'activo' ? 'bg-green-100 text-green-700' : equipo.status === 'inactivo' ? 'bg-gray-200 text-gray-500' : 'bg-yellow-100 text-yellow-700'}`}>{equipo.status}</span>
              )}
            </h1>
            {equipo?.description && (
              <div className="text-gray-600 text-sm mt-1 mb-1">{equipo.description}</div>
            )}
            <div className="text-xs text-gray-400 mb-1">Fecha de creación: <span className="font-mono bg-gray-100 px-1 rounded">{equipo?.createdAt ? new Date(equipo.createdAt).toLocaleDateString() : '-'}</span></div>
            <div className="text-xs text-gray-400">Token QR: <span className="font-mono bg-gray-100 px-1 rounded">{qr.token}</span></div>
          </div>
          {qr.imagenPath && (
            <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${qr.imagenPath}`} alt="QR" className="w-20 h-20 border rounded self-end md:self-center" />
          )}
        </div>

        {/* Indicadores principales */}
        <div className="flex flex-wrap gap-2 justify-start">
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
            <span>Serie:</span> <span className="font-mono">{equipo?.serialNumber || '-'}</span>
          </div>
          <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
            <span>Creado:</span> <span>{equipo?.createdAt ? new Date(equipo.createdAt).toLocaleDateString() : '-'}</span>
          </div>
          {/* Puedes agregar más indicadores aquí */}
        </div>

        {/* Documentación */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-1">Documentación</h2>
          <ul className="space-y-1">
            {!puedeVerPrivados && documentos.filter(doc => !doc.isPrivate).length === 0 && (
              <li className="text-gray-400 text-sm">No hay documentos asociados.</li>
            )}
            {puedeVerPrivados && documentos.length === 0 && (
              <li className="text-gray-400 text-sm">No hay documentos asociados.</li>
            )}
            {puedeVerPrivados
              ? documentos
                  .map(doc => (
                    <li key={doc.id} className="bg-gray-50 rounded px-2 py-1 text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2 relative">
                      <div className="flex-1 flex flex-col">
                        <span className="font-semibold text-gray-800">{doc.name}{doc.isPrivate ? <span className="ml-2 text-xs text-red-500 font-bold">Privado</span> : null}</span>
                        <span className="text-xs text-gray-500">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '-'}{doc.responsable ? ` · ${doc.responsable}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.filePath ? (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/equipments/documents/${doc.id}/download`}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Descargar
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">Sin archivo</span>
                        )}
                        {puedeVerPrivados && (
                          <button
                            title="Marcar como inactivo"
                            className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold px-1"
                            onClick={() => marcarDocumentoInactivo(doc.id)}
                            disabled={saving}
                            aria-label="Marcar como inactivo"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </li>
                  ))
              : documentos
                  .filter(doc => !doc.isPrivate)
                  .map(doc => (
                    <li key={doc.id} className="bg-gray-50 rounded px-2 py-1 text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2 relative">
                      <div className="flex-1 flex flex-col">
                        <span className="font-semibold text-gray-800">{doc.name}</span>
                        <span className="text-xs text-gray-500">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '-'}{doc.responsable ? ` · ${doc.responsable}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.filePath ? (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/equipments/documents/${doc.id}/download`}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Descargar
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">Sin archivo</span>
                        )}
                      </div>
                    </li>
                  ))
            }
          </ul>
        </div>

        {/* Mantenciones */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-1">
            <h2 className="text-base font-bold text-gray-800">Mantenciones</h2>
            {puedeVerPrivados && (
              <button
                className="w-full md:w-auto mt-2 md:mt-0 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-4 py-2 shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 text-sm flex items-center justify-center gap-2"
                style={{ minWidth: 180 }}
                onClick={() => router.push(`/qr/${token}/maintenances/nuevo`)}
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Agregar mantención
              </button>
            )}
          </div>
          <ul className="space-y-1">
            {mantenciones.length === 0 && (
              <li className="text-gray-400 text-sm">No hay mantenciones registradas.</li>
            )}
            {mantenciones.map(mant => (
              <li key={mant.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 text-sm">
                <span>
                  {mant.performedAt ? new Date(mant.performedAt).toLocaleDateString() : '-'}
                  {' - '}
                  {mant.status || '-'}
                  {' - '}
                  {mant.user?.userProfile?.fullName || mant.technician || 'Sin responsable'}
                </span>
                <button
                  className="text-blue-600 hover:underline text-xs"
                  onClick={() => router.push(`/qr/${token}/maintenances/${mant.id}`)}
                >
                  Ver
                </button>
              </li>
            ))}
          </ul>
        </div>


        {/* Botón para iniciar sesión o cerrar sesión */}
        {!isLoggedIn && (
          <button
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-sm mt-2"
            onClick={() => router.push(`/qr/login?token=${token}`)}
          >
            Iniciar sesión
          </button>
        )}
        {isLoggedIn && (
          <button
            className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold text-sm mt-2"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        )}

        {/* Login embebido eliminado, ahora es redirección */}

        {/* ...eliminado formulario de edición por clave 1234... */}

        {/* Descargar imagen QR */}
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/qr/${qr.token}/image`}
          download
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold text-sm mt-2"
        >
          Descargar imagen QR
        </a>
      </div>
    </div>
  );
}
