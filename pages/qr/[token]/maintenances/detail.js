import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function MaintenanceDetail() {
  const router = useRouter();
  const { token, id } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [maintenance, setMaintenance] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/maintenances/${id}`)
        .then(res => res.ok ? res.json() : Promise.reject('No encontrado')),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/maintenances/${id}/documents`)
        .then(res => res.ok ? res.json() : []),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/maintenances/${id}/photos`)
        .then(res => res.ok ? res.json() : [])
    ])
      .then(([mant, docs, phs]) => {
        setMaintenance(mant);
        setDocuments(docs);
        setPhotos(phs);
      })
      .catch(() => setError('No se encontró la mantención'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando detalle...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!maintenance) return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-6 px-2">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b pb-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              Detalle de Mantención
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-mono bg-gray-200 text-gray-700">ID: {maintenance.id}</span>
              {maintenance.status && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${maintenance.status === 'completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{maintenance.status}</span>
              )}
            </h1>
            <div className="text-gray-600 text-sm mb-1">{maintenance.description || 'Sin descripción'}</div>
            <div className="text-xs text-gray-400 mb-1">Fecha de mantención: <span className="font-mono bg-gray-100 px-1 rounded">{maintenance.fecha || '-'}</span></div>
            <div className="text-xs text-gray-400 mb-1">Hora de mantención: <span className="font-mono bg-gray-100 px-1 rounded">{maintenance.hora || '-'}</span></div>
            <div className="text-xs text-gray-400">Responsable: <span className="font-mono bg-gray-100 px-1 rounded">{maintenance.responsable || 'Sin responsable'}</span></div>
          </div>
        </div>

        {/* Documentos asociados */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Documentos asociados</h2>
          <ul className="space-y-2">
            {documents.length === 0 && <li className="text-gray-400 text-sm">No hay documentos.</li>}
            {documents.map(doc => (
              <li key={doc.id} className="bg-gray-50 rounded px-3 py-2 text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex-1 flex flex-col">
                  <span className="font-semibold text-gray-800">{doc.name}</span>
                  <span className="text-xs text-gray-500">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}{doc.responsable ? ` · ${doc.responsable}` : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  {doc.filePath ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/maintenances/documents/${doc.id}/download`}
                      className="text-blue-600 hover:underline text-xs"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Descargar
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs">Sin archivo</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Fotos asociadas */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Fotos asociadas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.length === 0 && <div className="text-gray-400 text-sm col-span-2">No hay fotos.</div>}
            {photos.map(photo => (
              <div key={photo.id} className="bg-gray-100 rounded-lg p-2 flex flex-col items-center">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/public${photo.filePath}`}
                  alt="Foto de mantención"
                  className="w-full h-32 object-cover rounded mb-2 border"
                  style={{ maxWidth: 180 }}
                  onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
                />
                <span className="text-xs text-gray-500">{photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString() : '-'}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
          onClick={() => router.back()}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
