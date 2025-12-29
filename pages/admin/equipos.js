
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';

export default function EquiposPage() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/equipments`)
      .then(res => res.json())
      .then(data => setEquipos(data))
      .catch(() => setError('Error al cargar los equipos'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este equipo?')) return;
    setDeletingId(id);
    await fetch(`/api/equipos/${id}`, { method: 'DELETE' });
    setEquipos(equipos.filter(e => e.id !== id));
    setDeletingId(null);
  };

  return (
    <AdminLayout>
      <div className="w-full py-4 px-2 md:px-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-1">Equipos</h1>
          {/* Mini header de acciones */}
          <div className="flex items-center gap-2 bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-1.5 mb-1">
            <Link href="/admin/equipos/nuevo" className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md shadow font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-300" title="Nuevo equipo">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Nuevo equipo
            </Link>
            {/* Puedes agregar más botones de acción aquí si lo deseas */}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 animate-pulse">
              <svg className="w-12 h-12 text-blue-400 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg>
              <span className="text-gray-400 text-xl">Cargando equipos...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24">
              <svg className="w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              <span className="text-red-500 text-xl">{error}</span>
            </div>
          ) : equipos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <svg className="w-20 h-20 text-blue-200 mb-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              <p className="text-gray-500 text-xl mb-2 font-medium">Aún no existe ningún equipo registrado.</p>
              <p className="text-gray-400 mb-6">¡Comienza creando tu primer equipo para gestionarlo fácilmente!</p>
              <Link href="/admin/equipos/nuevo" className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow font-semibold text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-300" title="Registrar equipo">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Registrar equipo
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Serie</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {equipos.map(equipo => (
                    <tr key={equipo.id} className="hover:bg-blue-50/40 transition group">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 group-hover:text-blue-700 transition">{equipo.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{equipo.serialNumber || <span className="text-gray-300">-</span>}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${equipo.status === 'activo' ? 'bg-green-100 text-green-700' : equipo.status === 'inactivo' ? 'bg-gray-200 text-gray-500' : 'bg-yellow-100 text-yellow-700'}`}>{equipo.status || 'Sin estado'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/admin/equipos/${equipo.id}/editar`} className="inline-flex items-center px-2 py-1 rounded-md text-blue-600 hover:bg-blue-50 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 text-[16px]" title="Editar">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z" /></svg>
                            Editar
                          </Link>
                          <button
                            className={`inline-flex items-center px-2 py-1 rounded-md text-red-600 hover:bg-red-50 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-red-200 text-[16px] ${deletingId === equipo.id ? 'opacity-50 pointer-events-none' : ''}`}
                            onClick={() => handleDelete(equipo.id)}
                            disabled={deletingId === equipo.id}
                            aria-label="Eliminar equipo"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            {deletingId === equipo.id ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
