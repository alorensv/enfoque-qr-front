import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from '../../contexts/AuthContext';
import FullScreenLoader from '../../components/FullScreenLoader';
import QrBrandBanner from '../../components/QrBrandBanner';
import { resolveThemeKeyForInstitution, themeCssVars } from '../../lib/theme';

export default function QrPage() {
  const { user } = useAuth();
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
    const session = Cookies.get('institucion_session') || Cookies.get('token');
    if (session) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const esInstitucionPropia = user && equipo && Number(user.institutionId) === Number(equipo.institutionId);
  // Solo puede ver privados si es de la propia institución
  const canSeePrivate = isLoggedIn && esInstitucionPropia;

  // Controlar si mostrar el login embebido
  const [showLogin, setShowLogin] = useState(false);

  // Cargar QR y datos de equipo relacionados
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    let equipoId = null;
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr/${token}`, {
        credentials: 'include',
      })
        .then(res => {
          if (!res.ok) throw new Error('QR no encontrado');
          return res.json();
        }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments/by-qr/${token}`, {
        credentials: 'include',
      })
        .then(res => res.ok ? res.json() : null)
    ])
      .then(async ([qrData, equipoData]) => {
        setQr(qrData);
        setEquipo(equipoData);
        setEditData(equipoData ? { ...equipoData } : null);
        // Registrar escaneo directo (fire-and-forget)
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr/${token}/scan`, {
          method: 'POST',
          credentials: 'include',
        }).catch(() => { });
        if (equipoData && equipoData.id) {
          equipoId = equipoData.id;
          // Obtener documentos reales
          const docsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments/${equipoId}/documents`, {
            credentials: 'include',
          });
          if (docsRes.ok) {
            const docs = await docsRes.json();
            setDocumentos(docs);
          } else {
            setDocumentos([]);
          }
          // Obtener mantenciones reales (atado al token del QR escaneado)
          const mantRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenances/equipment/${equipoId}?token=${encodeURIComponent(token || '')}`, {
            credentials: 'include',
          });
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments/documents/${docId}`, {
        method: 'DELETE',
        credentials: 'include',
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

  // Marcar mantención como inactiva (soft delete)
  const marcarMantencionInactiva = async (mantId) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta mantención?')) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenances/${mantId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setMantenciones(prev => prev.filter(m => m.id !== mantId));
        setSaveMsg('Mantención eliminada');
      } else {
        const err = await res.json().catch(() => ({}));
        setSaveMsg(err.message || 'Error al eliminar mantención');
      }
    } catch {
      setSaveMsg('Error al eliminar mantención');
    }
    setSaving(false);
  };


  if (loading) return <FullScreenLoader label="Cargando información" />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!qr) return null;

  // La marca (color + logo) depende de la institución DUEÑA DEL EQUIPO, no
  // del dominio desde el que se mira la página — el QR puede escanearse
  // desde cualquier lado. Se acota con variables CSS solo a esta tarjeta.
  const institutionSlug = equipo?.institution?.slug;
  const themeKey = resolveThemeKeyForInstitution(institutionSlug);
  const isLortech = themeKey === 'lortech';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden" style={themeCssVars(themeKey)}>

        {/* Banner Superior con marca del cliente (Lortech real, o Enfoque QR por defecto) */}
        <QrBrandBanner isLortech={isLortech} />

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-grow min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{equipo?.name || 'Equipo sin nombre'}</h1>
              <p className="text-sm text-gray-500">{equipo?.description}</p>
              <span className={`mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full ${equipo?.status === 'activo' ? 'bg-green-100 text-green-800' :
                  equipo?.status === 'inactivo' ? 'bg-gray-200 text-gray-600' :
                    'bg-yellow-100 text-yellow-800'
                }`}>{equipo?.status || 'sin estado'}</span>
            </div>
            {equipo?.equipmentPhoto && (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/equipments/${equipo.id}/photo`}
                alt="Foto del equipo"
                className="w-24 h-24 object-cover rounded-xl border border-[var(--color-border)] flex-shrink-0"
              />
            )}
          </div>

          {/* Última Mantención */}
          {lastMaintenance && (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-primary-soft)] p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/70">
                  <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
                </div>
                <h2 className="font-bold text-[var(--color-primary-strong)]">Última mantención</h2>
              </div>
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
          <div className="rounded-2xl border border-[var(--color-border)] p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--color-primary-soft)]">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>
              </div>
              <h2 className="font-bold text-gray-900">Detalles del equipo</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">N/S:</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">{equipo?.serialNumber || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Creado:</span>
                <span className="text-gray-800">{equipo?.createdAt ? new Date(equipo.createdAt).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          </div>

          {/* Documentación */}
          <div className="rounded-2xl border border-[var(--color-border)] p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--color-primary-soft)]">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              </div>
              <h2 className="font-bold text-gray-900">Documentación</h2>
            </div>
            <ul className="space-y-2">
              {documentos.filter(doc => canSeePrivate || !doc.isPrivate).length === 0 ? (
                <li className="text-gray-500 text-sm italic">No hay documentos disponibles.</li>
              ) : (
                documentos
                  .filter(doc => canSeePrivate || !doc.isPrivate)
                  .map(doc => (
                    <li key={doc.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-4 transition hover:bg-gray-100">
                      <div className="flex items-center gap-3 flex-grow min-w-0">
                        <span className="w-9 h-9 rounded-xl bg-[var(--color-primary-soft)] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {doc.name}
                            {!!doc.isPrivate && <span className="ml-2 text-xs font-bold text-red-600">(Privado)</span>}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}
                            {doc.responsable ? ` · ${doc.responsable}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {doc.filePath && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}/equipments/documents/${doc.id}/download`}
                            className="text-[var(--color-primary)] hover:underline text-sm font-medium"
                          >
                            Descargar
                          </a>
                        )}
                        {canSeePrivate && (
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
          <div className="rounded-2xl border border-[var(--color-border)] p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--color-primary-soft)]">
                  <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>
                </div>
                <h2 className="font-bold text-gray-900">Historial de mantenciones</h2>
              </div>
              {canSeePrivate && (
                <button
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold rounded-xl px-4 py-2 text-sm shadow-sm transition flex items-center gap-2 flex-shrink-0"
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
                  <li key={mant.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-3 flex-grow min-w-0">
                      <span className="w-9 h-9 rounded-xl bg-[var(--color-primary-soft)] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" /></svg>
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800">
                          {new Date(mant.performedAt).toLocaleDateString()} - <span className="font-normal">{mant.status}</span>
                        </p>
                        <p className="text-xs text-gray-600">
                          Resp: {mant.user?.userProfile?.fullName || mant.technician || 'No asignado'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        className="text-[var(--color-primary)] hover:underline font-medium"
                        onClick={() => router.push(`/qr/${token}/maintenances/detail?id=${mant.id}`)}
                      >
                        Ver Detalles
                      </button>
                      {canSeePrivate && user && (user.role === 'super' || user.role === 'admin' || user.userId === mant.userId) && (
                        <button
                          title="Eliminar mantención"
                          className="text-red-500 hover:text-red-700 font-bold"
                          onClick={() => marcarMantencionInactiva(mant.id)}
                          disabled={saving}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Footer y Acciones */}
          <div className="border-t border-[var(--color-border)] pt-5 text-center">
            {isLoggedIn ? (
              <button
                className="w-full max-w-xs mx-auto px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold text-sm transition"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                ¿Eres administrador?{' '}
                <button
                  className="text-[var(--color-primary)] hover:underline font-semibold"
                  onClick={() => router.push(`/qr/login?token=${token}`)}
                >
                  Inicia sesión aquí
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
