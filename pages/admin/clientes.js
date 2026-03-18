import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function ClientesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    if (!authLoading && user && user.role === 'institution_user') {
      router.replace('/admin/home');
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar clientes');
        return res.json();
      })
      .then((data) => {
        setClientes(data);
      })
      .catch((err) => setError(err.message || 'Error al cargar los clientes'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este cliente?')) return;
    setDeletingId(id);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || `Error ${response.status}: ${response.statusText}`);
      }
      // Actualizar la lista de clientes
      setClientes(clientes.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message || 'Error al eliminar el cliente');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="w-full py-4 px-2 md:px-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-1">Clientes</h1>
          <div className="flex items-center gap-2 bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-1.5 mb-1">
            <Link href="/admin/clientes/nuevo" className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md shadow font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-300" title="Nuevo cliente">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Nuevo cliente
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 animate-pulse">
              <svg className="w-12 h-12 text-blue-400 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg>
              <span className="text-gray-400 text-xl">Cargando clientes...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24">
              <svg className="w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              <span className="text-red-500 text-xl">{error}</span>
            </div>
          ) : clientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <svg className="w-20 h-20 text-blue-200 mb-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              <p className="text-gray-500 text-xl mb-2 font-medium">Aún no existe ningún cliente registrado.</p>
              <p className="text-gray-400 mb-6">¡Comienza creando tu primer cliente para asignarlo a tus equipos!</p>
              <Link href="/admin/clientes/nuevo" className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow font-semibold text-base transition-all focus:outline-none focus:ring-2 focus:ring-blue-300" title="Registrar cliente">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Registrar cliente
              </Link>
            </div>
          ) : (
            <div className="w-full">
              <table className="min-w-full divide-y divide-gray-200 table-auto">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Teléfono</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Equipos</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {clientes.map(cliente => (
                    <tr key={cliente.id} className="hover:bg-blue-50/40 transition group">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 group-hover:text-blue-700 transition">{cliente.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{cliente.email || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{cliente.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                          {cliente.equipments?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <ClientActionsDropdown
                          cliente={cliente}
                          deletingId={deletingId}
                          handleDelete={handleDelete}
                          isOpen={activeDropdown === cliente.id}
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

// Dropdown de acciones para cada cliente
function ClientActionsDropdown({ cliente, deletingId, handleDelete, isOpen, setIsOpen }) {
  const dropdownRef = useRef(null);
  const [isUp, setIsUp] = useState(false);

  const handleToggle = () => {
    if (!isOpen) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setIsUp(spaceBelow < 150);
    }
    setIsOpen(isOpen ? null : cliente.id);
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
              className={`flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 font-semibold w-full ${deletingId === cliente.id ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => { setIsOpen(null); handleDelete(cliente.id); }}
              disabled={deletingId === cliente.id}
              aria-label="Eliminar cliente"
              title="Eliminar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              {deletingId === cliente.id ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
