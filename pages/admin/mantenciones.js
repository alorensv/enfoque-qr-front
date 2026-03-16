import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';

export default function MantencionesPage() {
  const [mantenciones, setMantenciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState({ id: null, type: null }); // type: 'delete' o 'restore'
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    fetchMantenciones();
  }, []);

  const fetchMantenciones = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenances/admin/all`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar las mantenciones');
      const data = await response.json();
      setMantenciones(data);
    } catch (err) {
      setError(err.message || 'Error al cargar las mantenciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta mantención?')) return;
    setActionId({ id, type: 'delete' });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenances/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || `Error ${response.status}: ${response.statusText}`);
      }
      // Actualizar estado local a eliminada
      setMantenciones(mantenciones.map(m => m.id === id ? { ...m, deletedAt: new Date().toISOString() } : m));
    } catch (err) {
      alert(err.message || 'Error al eliminar la mantención');
    } finally {
      setActionId({ id: null, type: null });
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm('¿Seguro que deseas restaurar esta mantención?')) return;
    setActionId({ id, type: 'restore' });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenances/${id}/restore`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || `Error ${response.status}: ${response.statusText}`);
      }
      // Actualizar estado local a activa
      setMantenciones(mantenciones.map(m => m.id === id ? { ...m, deletedAt: null } : m));
    } catch (err) {
      alert(err.message || 'Error al restaurar la mantención');
    } finally {
      setActionId({ id: null, type: null });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="w-full py-4 px-2 md:px-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-1">Mantenciones</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 animate-pulse">
              <svg className="w-12 h-12 text-blue-400 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg>
              <span className="text-gray-400 text-xl">Cargando mantenciones...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24">
              <svg className="w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              <span className="text-red-500 text-xl">{error}</span>
            </div>
          ) : mantenciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <svg className="w-20 h-20 text-blue-200 mb-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              <p className="text-gray-500 text-xl mb-2 font-medium">Aún no existe ninguna mantención registrada.</p>
              <p className="text-gray-400 mb-6">Las mantenciones se agregarán aquí.</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-auto">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Equipo</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Técnico/Responsable</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {mantenciones.map(mant => (
                    <tr key={mant.id} className="hover:bg-blue-50/40 transition group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition">
                            {formatDate(mant.performedAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/admin/equipos/${mant.equipmentId}/editar`} className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">
                          {mant.equipment?.name || 'Equipo desconocido'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                        {mant.user?.userProfile?.fullName || mant.technician || 'No asignado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${mant.deletedAt ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {mant.deletedAt ? 'Eliminada' : 'Activa'}
                        </span>
                        {!mant.deletedAt && (
                          <span className="ml-2 text-xs text-gray-500">
                            {mant.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <MaintenanceActionsDropdown
                          maintenance={mant}
                          actionId={actionId}
                          handleDelete={handleDelete}
                          handleRestore={handleRestore}
                          isOpen={activeDropdown === mant.id}
                          setIsOpen={setActiveDropdown}
                        />
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

// Dropdown de acciones para cada mantención
function MaintenanceActionsDropdown({ maintenance: mant, actionId, handleDelete, handleRestore, isOpen, setIsOpen }) {
  const dropdownRef = useRef(null);
  const [isUp, setIsUp] = useState(false);

  const handleToggle = () => {
    if (!isOpen) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setIsUp(spaceBelow < 150);
    }
    setIsOpen(isOpen ? null : mant.id);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(null);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  const isDeleting = actionId.id === mant.id && actionId.type === 'delete';
  const isRestoring = actionId.id === mant.id && actionId.type === 'restore';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={handleToggle}
        title="Acciones"
      >
        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {isOpen && (
        <div className={`origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 ${isUp ? 'bottom-full mb-2' : 'top-full'}`}>
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {mant.equipment?.qrCodes?.[0]?.token && (
              <Link
                href={`/qr/${mant.equipment.qrCodes[0].token}/maintenances/detail?id=${mant.id}`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 font-semibold w-full"
                title="Ver detalles de mantención"
                onClick={() => setIsOpen(null)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                Ver Detalles
              </Link>
            )}
            <Link
              href={`/admin/equipos/${mant.equipmentId}/editar`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 font-semibold w-full"
              title="Ver equipo asociado"
              onClick={() => setIsOpen(null)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              Ver Equipo
            </Link>

            {mant.deletedAt ? (
              <button
                className={`flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 font-semibold w-full ${isRestoring ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => { setIsOpen(null); handleRestore(mant.id); }}
                disabled={isRestoring || isDeleting}
                aria-label="Restaurar mantención"
                title="Restaurar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                {isRestoring ? 'Restaurando...' : 'Restaurar'}
              </button>
            ) : (
              <button
                className={`flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 font-semibold w-full ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => { setIsOpen(null); handleDelete(mant.id); }}
                disabled={isDeleting || isRestoring}
                aria-label="Eliminar mantención"
                title="Eliminar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
