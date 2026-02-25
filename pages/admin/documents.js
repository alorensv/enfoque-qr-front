import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments/documents`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar los documentos');
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este documento?')) return;
    setDeletingId(id);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments/documents/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || `Error ${response.status}: ${response.statusText}`);
      }
      // Eliminar del estado local
      setDocuments(documents.filter(d => d.id !== id));
    } catch (err) {
      setError(err.message || 'Error al eliminar el documento');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-1">Documentos</h1>
          {/* Mini header de acciones */}
          <div className="flex items-center gap-2 bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-1.5 mb-1">
            <Link href="/admin/docs/nuevo" className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md shadow font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-300" title="Nuevo documento">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Nuevo documento
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 animate-pulse">
              <svg className="w-12 h-12 text-blue-400 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg>
              <span className="text-gray-400 text-xl">Cargando documentos...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24">
              <svg className="w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              <span className="text-red-500 text-xl">{error}</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <svg className="w-20 h-20 text-blue-200 mb-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="text-gray-500 text-xl mb-2 font-medium">Aún no existe ningún documento registrado.</p>
              <p className="text-gray-400 mb-6">¡Comienza agregando tu primer documento!</p>
              <Link href="/admin/docs/nuevo" className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow font-semibold text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-300" title="Agregar documento">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Agregar documento
              </Link>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-auto">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Equipo</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Autor</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-blue-50/40 transition group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition">{doc.name}</div>
                            {doc.type && <div className="text-xs text-gray-400">{doc.type}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/admin/equipos/${doc.equipmentId}/editar`} className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">
                          {doc.equipmentName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">{formatDate(doc.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{doc.responsable}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${doc.isPrivate ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {doc.isPrivate ? 'Privado' : 'Público'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <DocumentActionsDropdown
                          document={doc}
                          deletingId={deletingId}
                          handleDelete={handleDelete}
                          isOpen={activeDropdown === doc.id}
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

// Dropdown de acciones para cada documento
function DocumentActionsDropdown({ document: doc, deletingId, handleDelete, isOpen, setIsOpen }) {
  const dropdownRef = useRef(null);
  const [isUp, setIsUp] = useState(false);

  const handleToggle = () => {
    if (!isOpen) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Si no hay espacio abajo, ábrelo hacia arriba
      setIsUp(spaceBelow < 150);
    }
    setIsOpen(isOpen ? null : doc.id);
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

  const handleDownload = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/equipments/documents/${doc.id}/download`, '_blank');
    setIsOpen(null);
  };

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
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 font-semibold w-full"
              title="Descargar documento"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Descargar
            </button>
            <Link
              href={`/admin/equipos/${doc.equipmentId}/editar`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 font-semibold w-full"
              title="Ver equipo asociado"
              onClick={() => setIsOpen(null)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              Ver Equipo
            </Link>
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 font-semibold w-full ${deletingId === doc.id ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => { setIsOpen(null); handleDelete(doc.id); }}
              disabled={deletingId === doc.id}
              aria-label="Eliminar documento"
              title="Eliminar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              {deletingId === doc.id ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
