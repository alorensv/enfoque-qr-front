import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '/contexts/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL;

const ACTION_LABELS = {
  CREACION: 'Creación',
  EDICION: 'Edición',
  ELIMINACION: 'Eliminación',
  RESTAURACION: 'Restauración',
  FOTOS_AGREGADAS: 'Fotos agregadas',
  DOCUMENTOS_AGREGADOS: 'Documentos agregados',
  FOTO_ELIMINADA: 'Foto eliminada',
};

export default function MaintenanceDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [maintenance, setMaintenance] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [logs, setLogs] = useState([]);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ description: '', performedAt: '', technician: '', status: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [mant, docs, phs, lgs] = await Promise.all([
        fetch(`${API}/maintenances/${id}`, { credentials: 'include' }).then((r) => (r.ok ? r.json() : Promise.reject('No encontrado'))),
        fetch(`${API}/maintenances/${id}/documents`, { credentials: 'include' }).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API}/maintenances/${id}/photos`, { credentials: 'include' }).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API}/maintenances/${id}/logs`, { credentials: 'include' }).then((r) => (r.ok ? r.json() : [])),
      ]);
      setMaintenance(mant);
      setDocuments(docs);
      setPhotos(phs);
      setLogs(lgs);
    } catch {
      setError('No se encontró la mantención');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const canEdit =
    !!user &&
    !!maintenance &&
    (user.role === 'admin' || user.role === 'super' || String(user.userId) === String(maintenance.userId));

  const startEdit = () => {
    setForm({
      description: maintenance.description || '',
      performedAt: maintenance.fecha && maintenance.hora ? `${maintenance.fecha}T${maintenance.hora}` : '',
      technician: maintenance.technician || '',
      status: maintenance.status || '',
    });
    setMsg(null);
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`${API}/maintenances/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || 'Error al guardar');
      }
      setEditing(false);
      await load();
      setMsg('Cambios guardados correctamente.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPhotos = async (files) => {
    if (!files || files.length === 0) return;
    setSaving(true);
    setMsg(null);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('photos', f));
      const res = await fetch(`${API}/maintenances/${id}/photos`, { method: 'POST', credentials: 'include', body: fd });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || 'Error al subir las fotos');
      }
      await load();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('¿Eliminar esta foto?')) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`${API}/maintenances/photos/${photoId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || 'Error al eliminar la foto');
      }
      await load();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando detalle...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!maintenance) return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-6 px-2">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-6">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b pb-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2 flex-wrap">
              Detalle de Mantención
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-gray-200 text-gray-700">ID: {maintenance.id}</span>
              {maintenance.status && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${maintenance.status === 'completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{maintenance.status}</span>
              )}
            </h1>
            {!editing && (
              <>
                <div className="text-gray-600 text-sm mb-1">{maintenance.description || 'Sin descripción'}</div>
                <div className="text-xs text-gray-400 mb-1">Fecha de mantención: <span className="font-mono bg-gray-100 px-1 rounded">{maintenance.fecha || '-'}</span></div>
                <div className="text-xs text-gray-400 mb-1">Hora de mantención: <span className="font-mono bg-gray-100 px-1 rounded">{maintenance.hora || '-'}</span></div>
                <div className="text-xs text-gray-400">Responsable: <span className="font-mono bg-gray-100 px-1 rounded">{maintenance.responsable || maintenance.technician || 'Sin responsable'}</span></div>
              </>
            )}
          </div>
          {canEdit && !editing && (
            <button
              className="self-start bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 text-sm shadow-sm transition flex items-center gap-2"
              onClick={startEdit}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
              Editar
            </button>
          )}
        </div>

        {msg && <div className="text-sm text-center text-blue-700 bg-blue-50 border border-blue-100 rounded-lg py-2">{msg}</div>}

        {/* Formulario de edición */}
        {editing && (
          <div className="flex flex-col gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <label className="text-sm font-semibold text-gray-700">Descripción
              <textarea
                className="border rounded px-2 py-1 text-sm w-full mt-1"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">Fecha y hora
              <input
                type="datetime-local"
                className="border rounded px-2 py-1 text-sm w-full mt-1"
                value={form.performedAt}
                onChange={(e) => setForm({ ...form, performedAt: e.target.value })}
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">Técnico responsable
              <input
                type="text"
                className="border rounded px-2 py-1 text-sm w-full mt-1"
                value={form.technician}
                onChange={(e) => setForm({ ...form, technician: e.target.value })}
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">Estado
              <select
                className="border rounded px-2 py-1 text-sm w-full mt-1"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="completada">Completada</option>
                <option value="pendiente">Pendiente</option>
                <option value="incompleta">Incompleta</option>
              </select>
            </label>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100" onClick={() => setEditing(false)} disabled={saving}>Cancelar</button>
              <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )}

        {/* Documentos */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Documentos asociados</h2>
          <ul className="space-y-2">
            {documents.length === 0 && <li className="text-gray-400 text-sm">No hay documentos.</li>}
            {documents.map((doc) => (
              <li key={doc.id} className="bg-gray-50 rounded px-3 py-2 text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex-1 flex flex-col">
                  <span className="font-semibold text-gray-800">{doc.name}</span>
                  <span className="text-xs text-gray-500">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}{doc.responsable ? ` · ${doc.responsable}` : ''}</span>
                </div>
                {doc.filePath ? (
                  <a href={`${API}/maintenances/documents/${doc.id}/download`} className="text-blue-600 hover:underline text-xs" target="_blank" rel="noopener noreferrer">Descargar</a>
                ) : (
                  <span className="text-gray-400 text-xs">Sin archivo</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Fotos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-800">Fotos asociadas</h2>
            {canEdit && (
              <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-3 py-1.5 text-xs shadow-sm transition">
                + Agregar fotos
                <input type="file" accept="image/*" multiple className="hidden" disabled={saving} onChange={(e) => handleAddPhotos(e.target.files)} />
              </label>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.length === 0 && <div className="text-gray-400 text-sm col-span-2">No hay fotos.</div>}
            {photos.map((photo) => (
              <div key={photo.id} className="bg-gray-100 rounded-lg p-2 flex flex-col items-center relative">
                {canEdit && (
                  <button
                    title="Eliminar foto"
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center shadow disabled:opacity-50"
                    onClick={() => handleDeletePhoto(photo.id)}
                    disabled={saving}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${API}/maintenances/photos/${photo.id}/file`}
                  alt="Foto de mantención"
                  className="w-full h-32 object-cover rounded mb-2 border"
                  style={{ maxWidth: 180 }}
                  onError={(e) => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
                />
                <span className="text-xs text-gray-500">{photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString() : '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Historial de cambios (logs) */}
        {logs.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Historial de cambios</h2>
            <ul className="border border-gray-100 rounded-lg divide-y divide-gray-100">
              {logs.map((log) => (
                <li key={log.id} className="px-3 py-2 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800">{ACTION_LABELS[log.action] || log.action}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {log.responsable ? `Por ${log.responsable}` : `Usuario #${log.userId}`}
                      {log.description ? ` · ${log.description}` : ''}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString('es-CL') : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700" onClick={() => router.back()}>
          Volver
        </button>
      </div>
    </div>
  );
}
