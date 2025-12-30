
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function QrPage() {
  const router = useRouter();
  const { token } = router.query;
  const [qr, setQr] = useState(null);
  const [equipo, setEquipo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clave, setClave] = useState('');
  const [claveOk, setClaveOk] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  // Cargar QR y datos de equipo relacionados
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    // Consultar QR y equipo en paralelo
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/qr/${token}`)
        .then(res => {
          if (!res.ok) throw new Error('QR no encontrado');
          return res.json();
        }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/equipments/by-qr/${token}`)
        .then(res => res.ok ? res.json() : null)
    ])
      .then(([qrData, equipoData]) => {
        setQr(qrData);
        setEquipo(equipoData);
        setEditData(equipoData ? { ...equipoData } : null);
      })
      .catch(() => setError('QR no encontrado'))
      .finally(() => setLoading(false));
  }, [token]);

  // Simulación de validación de clave (reemplazar por API real)
  const validarClave = async () => {
    setClaveOk(false);
    setSaveMsg(null);
    // Aquí deberías validar la clave contra el backend
    if (clave === '1234') {
      setClaveOk(true);
    } else {
      setSaveMsg('Clave incorrecta');
    }
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
          {/* Simulación de documentos */}
          <ul className="space-y-1">
            <li className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 text-sm">
              <span>Manual.pdf</span>
              <button className="text-blue-600 hover:underline text-xs">Descargar</button>
            </li>
            <li className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 text-sm">
              <span>Certificado.pdf</span>
              <button className="text-blue-600 hover:underline text-xs">Descargar</button>
            </li>
          </ul>
        </div>

        {/* Mantenciones */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-1">Mantenciones</h2>
          {/* Simulación de mantenciones */}
          <ul className="space-y-1">
            <li className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 text-sm">
              <span>12/25 - OK - Juan P.</span>
              <button className="text-blue-600 hover:underline text-xs">Ver</button>
            </li>
            <li className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 text-sm">
              <span>10/25 - Pendiente - Ana M.</span>
              <button className="text-blue-600 hover:underline text-xs">Ver</button>
            </li>
          </ul>
        </div>

        {/* Sección de código (clave) */}
        <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
          <label className="font-semibold text-sm text-gray-700">Código de acceso:</label>
          <div className="flex gap-2">
            <input
              type="password"
              className="border rounded px-2 py-1 text-sm flex-1"
              value={clave}
              onChange={e => setClave(e.target.value)}
              placeholder="Ingrese clave"
              disabled={claveOk}
            />
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
              onClick={validarClave}
              disabled={claveOk}
            >
              Validar
            </button>
          </div>
          {saveMsg && <div className={`text-xs ${claveOk ? 'text-green-600' : 'text-red-500'}`}>{saveMsg}</div>}
        </div>

        {/* Formulario de edición si clave válida */}
        {claveOk && editData && (
          <form
            className="bg-blue-50 rounded-xl p-4 flex flex-col gap-2 mt-2"
            onSubmit={e => {
              e.preventDefault();
              guardarCambios();
            }}
          >
            <h3 className="font-bold text-blue-900 mb-2">Editar información del equipo</h3>
            <label className="text-sm font-semibold">Nombre:
              <input
                className="border rounded px-2 py-1 text-sm w-full mt-1"
                value={editData.name || ''}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
              />
            </label>
            <label className="text-sm font-semibold">Serie:
              <input
                className="border rounded px-2 py-1 text-sm w-full mt-1"
                value={editData.serialNumber || ''}
                onChange={e => setEditData({ ...editData, serialNumber: e.target.value })}
              />
            </label>
            {/* Agrega más campos editables según sea necesario */}
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-1 rounded font-semibold text-sm hover:bg-green-700 disabled:opacity-50"
                disabled={saving}
              >
                Guardar
              </button>
              <button
                type="button"
                className="bg-gray-300 text-gray-700 px-4 py-1 rounded font-semibold text-sm hover:bg-gray-400"
                onClick={() => setClaveOk(false)}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
            {saving && <div className="text-xs text-blue-600">Guardando...</div>}
            {saveMsg && <div className="text-xs text-green-600">{saveMsg}</div>}
          </form>
        )}

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
