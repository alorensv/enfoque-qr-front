import { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';

const API = process.env.NEXT_PUBLIC_API_URL;
const resolveLogo = (logoUrl) => (logoUrl && logoUrl.startsWith('http') ? logoUrl : `${API}${logoUrl || ''}`);

function timeAgo(value) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const day = 86400000;
  if (diff < day) return 'hoy';
  const days = Math.floor(diff / day);
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  const years = Math.floor(months / 12);
  return `hace ${years} ${years === 1 ? 'año' : 'años'}`;
}

export default function ClientesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Branding institución + etiqueta del cliente para descarga
  const [logoUrl, setLogoUrl] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [labelClient, setLabelClient] = useState(null); // { id, name, token }
  const labelRef = useRef(null);

  // Edición de cliente (modal)
  const [editClient, setEditClient] = useState(null); // { id, name, email, phone, address }
  const [savingEdit, setSavingEdit] = useState(false);

  // Filtros
  const [search, setSearch] = useState('');
  const [equiposFilter, setEquiposFilter] = useState(''); // '', 'con', 'sin'

  const filteredClientes = clientes.filter((c) => {
    if (equiposFilter === 'con' && !c.equipmentCount) return false;
    if (equiposFilter === 'sin' && c.equipmentCount) return false;
    const q = search.trim().toLowerCase();
    if (q) {
      const hay = `${c.name || ''} ${c.email || ''} ${c.phone || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const hasFilters = !!(search || equiposFilter);

  const loadClientes = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`${API}/clients/overview`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar clientes');
        return res.json();
      })
      .then((data) => setClientes(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || 'Error al cargar los clientes'))
      .finally(() => setLoading(false));
  }, []);

  // Cargar nombre + logo de la institución (para la etiqueta)
  useEffect(() => {
    if (!user?.institutionId) return;
    fetch(`${API}/institutions/${user.institutionId}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setInstitutionName(d.name || '');
        if (d.settings?.logo_url) setLogoUrl(d.settings.logo_url);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!authLoading && user && user.role === 'institution_user') {
      router.replace('/admin/home');
      return;
    }
    loadClientes();
  }, [authLoading, user, loadClientes, router]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este cliente?')) return;
    setDeletingId(id);
    try {
      const response = await fetch(`${API}/clients/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || `Error ${response.status}: ${response.statusText}`);
      setClientes(clientes.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message || 'Error al eliminar el cliente');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSave = async () => {
    if (!editClient?.name?.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`${API}/clients/${editClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: editClient.name,
          email: editClient.email || null,
          phone: editClient.phone || null,
          address: editClient.address || null,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || 'Error al guardar');
      }
      setEditClient(null);
      loadClientes();
    } catch (err) {
      alert(err.message || 'No se pudo guardar el cliente');
    } finally {
      setSavingEdit(false);
    }
  };

  // Prepara la etiqueta del cliente y dispara la captura/descarga
  const handleDownloadQr = async (cliente) => {
    try {
      const res = await fetch(`${API}/clients/${cliente.id}/public-qr`, { credentials: 'include' });
      if (!res.ok) throw new Error('No se pudo generar el QR');
      const data = await res.json();
      setLabelClient({ id: cliente.id, name: cliente.name, token: data.token });
    } catch (err) {
      alert(err.message || 'No se pudo descargar el QR');
    }
  };

  // Cuando la etiqueta está montada, capturarla con html2canvas y descargar
  useEffect(() => {
    if (!labelClient) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const canvas = await html2canvas(labelRef.current, { scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false });
        if (cancelled) return;
        const link = document.createElement('a');
        link.download = `etiqueta-cliente-${labelClient.name?.replace(/\s+/g, '_') || labelClient.id}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        alert('No se pudo generar la etiqueta');
      } finally {
        if (!cancelled) setLabelClient(null);
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [labelClient]);

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
              <Link href="/admin/clientes/nuevo" className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow font-semibold text-base transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Registrar cliente
              </Link>
            </div>
          ) : (
            <>
              {/* Barra de filtros */}
              <div className="flex flex-col md:flex-row md:items-center gap-2 p-3 border-b border-gray-100">
                <div className="relative flex-1 min-w-0">
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, email o teléfono…" className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <select value={equiposFilter} onChange={(e) => setEquiposFilter(e.target.value)} className="py-2 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="">Todos</option>
                  <option value="con">Con equipos</option>
                  <option value="sin">Sin equipos</option>
                </select>
                {hasFilters && (
                  <button onClick={() => { setSearch(''); setEquiposFilter(''); }} className="py-2 px-3 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">Limpiar</button>
                )}
                <span className="text-xs text-gray-400 md:ml-1 whitespace-nowrap">{filteredClientes.length} de {clientes.length}</span>
              </div>

              {filteredClientes.length === 0 ? (
                <div className="py-16 text-center text-gray-400">No hay clientes que coincidan con los filtros.</div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Equipos</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Última actividad</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredClientes.map((cliente) => (
                        <tr key={cliente.id} className="hover:bg-blue-50/40 transition group">
                          {/* Cliente + contacto */}
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition">{cliente.name}</div>
                            <div className="text-xs text-gray-400 truncate max-w-[240px]">
                              {cliente.email || 'Sin email'}{cliente.phone ? ` · ${cliente.phone}` : ''}
                            </div>
                          </td>

                          {/* Equipos (clickable -> equipos filtrado) */}
                          <td className="px-4 py-4 text-center">
                            <Link
                              href={`/admin/equipos?clientId=${cliente.id}`}
                              title={`Ver los equipos de ${cliente.name}`}
                              className="inline-flex items-center justify-center min-w-[1.75rem] px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white transition"
                            >
                              {cliente.equipmentCount || 0}
                            </Link>
                          </td>

                          {/* Última actividad */}
                          <td className="px-6 py-4">
                            <LastActivity activity={cliente.lastActivity} />
                          </td>

                          {/* Acciones */}
                          <td className="px-4 py-4 text-center">
                            <ClientActionsDropdown
                              cliente={cliente}
                              deletingId={deletingId}
                              handleDelete={handleDelete}
                              onDownloadQr={handleDownloadQr}
                              onEdit={() => setEditClient({ id: cliente.id, name: cliente.name, email: cliente.email || '', phone: cliente.phone || '', address: cliente.address || '' })}
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
            </>
          )}
        </div>
      </div>

      {/* Modal de edición de cliente */}
      {editClient && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => !savingEdit && setEditClient(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Editar cliente</h2>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-700">Nombre
                <input type="text" className="border rounded px-2 py-1.5 text-sm w-full mt-1" value={editClient.name} onChange={(e) => setEditClient({ ...editClient, name: e.target.value })} />
              </label>
              <label className="text-sm font-semibold text-gray-700">Email
                <input type="email" className="border rounded px-2 py-1.5 text-sm w-full mt-1" value={editClient.email} onChange={(e) => setEditClient({ ...editClient, email: e.target.value })} />
              </label>
              <label className="text-sm font-semibold text-gray-700">Teléfono
                <input type="text" className="border rounded px-2 py-1.5 text-sm w-full mt-1" value={editClient.phone} onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })} />
              </label>
              <label className="text-sm font-semibold text-gray-700">Dirección
                <input type="text" className="border rounded px-2 py-1.5 text-sm w-full mt-1" value={editClient.address} onChange={(e) => setEditClient({ ...editClient, address: e.target.value })} />
              </label>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100" onClick={() => setEditClient(null)} disabled={savingEdit}>Cancelar</button>
              <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50" onClick={handleEditSave} disabled={savingEdit}>
                {savingEdit ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Etiqueta del cliente (oculta) que se captura como PNG al descargar */}
      {labelClient && (
        <div style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }}>
          <div
            ref={labelRef}
            style={{
              width: 380,
              padding: '40px 30px',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <div style={{ height: 70, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveLogo(logoUrl)}
                  alt={institutionName}
                  crossOrigin="anonymous"
                  style={{ maxHeight: '100%', maxWidth: 200, objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div style={{ fontWeight: 800, fontSize: 24, color: '#1e293b' }}>{institutionName}</div>
              )}
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: '#0f172a', margin: '0 0 25px 0', lineHeight: 1.3 }}>
              Escanear para ver tus equipos
            </h3>
            <div style={{ padding: 12, background: '#fff', borderRadius: 8, border: '1.5px solid #f1f5f9', display: 'inline-block', marginBottom: 25 }}>
              <QRCodeSVG
                value={typeof window !== 'undefined' ? `${window.location.origin}/qr/cliente/${labelClient.token}` : ''}
                size={240}
                level="H"
                includeMargin={false}
              />
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', width: '100%', paddingTop: 20 }}>
              <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500, margin: 0, letterSpacing: '0.01em' }}>
                {labelClient.name} · <strong style={{ color: '#1e293b' }}>{institutionName || 'Enfoque QR'}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// Celda "Última actividad": tipo + equipo + fecha relativa + responsable
function LastActivity({ activity }) {
  if (!activity) {
    return <span className="text-xs text-gray-400 italic">Sin actividad</span>;
  }
  const isMant = activity.type === 'mantención';
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: isMant ? '#dbeafe' : '#f1f5f9', color: isMant ? '#1d4ed8' : '#475569' }}
      >
        {isMant ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" /></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
        )}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-gray-800 truncate">
          <span className={`font-semibold ${isMant ? 'text-blue-700' : 'text-slate-600'}`}>{isMant ? 'Mantención' : 'Documento'}</span>
          <span className="text-gray-400"> · </span>
          {activity.equipmentName || 'Equipo'}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {timeAgo(activity.date)}{activity.responsable ? ` · ${activity.responsable}` : ''}
        </p>
      </div>
    </div>
  );
}

// Dropdown de acciones para cada cliente
function ClientActionsDropdown({ cliente, deletingId, handleDelete, onDownloadQr, onEdit, isOpen, setIsOpen }) {
  const dropdownRef = useRef(null);
  const [isUp, setIsUp] = useState(false);
  const [working, setWorking] = useState(false);

  const handleOpenPublic = async () => {
    setWorking(true);
    try {
      const res = await fetch(`${API}/clients/${cliente.id}/public-qr`, { credentials: 'include' });
      if (!res.ok) throw new Error('No se pudo obtener el enlace');
      const data = await res.json();
      window.open(`${window.location.origin}/qr/cliente/${data.token}`, '_blank');
    } catch (err) {
      alert(err.message || 'No se pudo abrir la página pública');
    } finally {
      setWorking(false);
      setIsOpen(null);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setIsUp(spaceBelow < 230);
    }
    setIsOpen(isOpen ? null : cliente.id);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(null);
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  const itemClass = 'flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-semibold w-full text-left';

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
          <div className="py-1" role="menu">
            <Link href={`/admin/equipos?clientId=${cliente.id}`} className={itemClass} onClick={() => setIsOpen(null)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Ver equipos
            </Link>
            <button className={itemClass} onClick={() => { setIsOpen(null); onEdit(); }} title="Editar cliente">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
              Editar
            </button>
            <button className={itemClass} onClick={() => { setIsOpen(null); onDownloadQr(cliente); }} title="Descargar etiqueta QR del cliente">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm12 0h4m-4 3h4m-4 3h2" /></svg>
              Descargar etiqueta QR
            </button>
            <button className={itemClass} onClick={handleOpenPublic} disabled={working} title="Ver página pública del cliente">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              Ver página pública
            </button>
            <div className="my-1 border-t border-gray-100" />
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 font-semibold w-full text-left ${deletingId === cliente.id ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => { setIsOpen(null); handleDelete(cliente.id); }}
              disabled={deletingId === cliente.id}
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
