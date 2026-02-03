import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';


export default function EquiposPage() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [qrMap, setQrMap] = useState({}); // { [equipoId]: [qrs] }
  const [docMap, setDocMap] = useState({}); // { [equipoId]: cantidad }
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments`)
      .then(res => res.json())
      .then(async (data) => {
        setEquipos(data);
        // Para cada equipo, buscar sus QR y documentos
        const [qrResults, docResults] = await Promise.all([
          Promise.all(
            data.map(async (equipo) => {
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments/${equipo.id}/qrs`);
                if (!res.ok) return [equipo.id, []];
                const qrs = await res.json();
                return [equipo.id, qrs];
              } catch {
                return [equipo.id, []];
              }
            })
          ),
          Promise.all(
            data.map(async (equipo) => {
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments/${equipo.id}/documents`);
                if (!res.ok) return [equipo.id, 0];
                const docs = await res.json();
                return [equipo.id, Array.isArray(docs) ? docs.length : 0];
              } catch {
                return [equipo.id, 0];
              }
            })
          )
        ]);
        setQrMap(Object.fromEntries(qrResults));
        setDocMap(Object.fromEntries(docResults));
      })
      .catch(() => setError('Error al cargar los equipos'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este equipo?')) return;
    setDeletingId(id);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments/${id}`, { method: 'DELETE' });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setError(err.message || 'Error al eliminar el equipos');
    }
    setEquipos(equipos.filter(e => e.id !== id));
    setDeletingId(null);
    // Eliminar QR del mapa
    setQrMap(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
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
            <div className="w-full">
              <table className="min-w-full divide-y divide-gray-200 table-auto">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Serie</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">QR</th>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {Array.isArray(qrMap[equipo.id]) && qrMap[equipo.id].length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {qrMap[equipo.id].map((qr, idx) => (
                              <div key={qr.token || idx} className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs">{qr.estado}</span>
                                {/* Link a detalle QR y contador de docs */}
                                <Link href={`/qr/${qr.token}`} title="Ver detalle y documentos">
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs font-bold">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
                                    {docMap[equipo.id] || 0} Docs
                                  </span>
                                </Link>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">Sin QR</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <EquipmentActionsDropdown
                          equipo={equipo}
                          deletingId={deletingId}
                          handleDelete={handleDelete}
                          qrs={qrMap[equipo.id] || []}
                          isOpen={activeDropdown === equipo.id}
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

// Dropdown de acciones para cada equipo (fuera del componente principal)
function EquipmentActionsDropdown({ equipo, deletingId, handleDelete, qrs, isOpen, setIsOpen }) {
  const dropdownRef = useRef(null);
  const [isUp, setIsUp] = useState(false);

  const handleToggle = () => {
    if (!isOpen) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Si no hay espacio abajo (aprox. 150px para el menú), ábrelo hacia arriba
      setIsUp(spaceBelow < 150);
    }
    setIsOpen(isOpen ? null : equipo.id);
  };

  // Cerrar el menú al hacer click fuera
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
        <div className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 ${isUp ? 'bottom-full mb-2' : 'top-full'}`}>
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {qrs.map(qr => (
              <a
                key={qr.token}
                href={`${process.env.NEXT_PUBLIC_API_URL}/qr/${qr.token}/image`}
                download
                className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 font-semibold w-full"
                title="Descargar QR"
                onClick={() => setIsOpen(null)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Descargar QR
              </a>
            ))}
            <Link
              href={{ pathname: '/admin/docs/nuevo', query: { equipmentId: equipo.id } }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 font-semibold w-full"
              title="Agregar documentación"
              onClick={() => setIsOpen(null)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Agregar Doc
            </Link>
            <Link
              href={`/admin/equipos/${equipo.id}/editar`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 font-semibold w-full"
              title="Editar"
              onClick={() => setIsOpen(null)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z" /></svg>
              Editar
            </Link>
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 font-semibold w-full ${deletingId === equipo.id ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => { setIsOpen(null); handleDelete(equipo.id); }}
              disabled={deletingId === equipo.id}
              aria-label="Eliminar equipo"
              title="Eliminar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              {deletingId === equipo.id ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
