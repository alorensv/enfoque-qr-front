import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import EtiquetaEquipo from '../../components/EtiquetaEquipo';
import EtiquetaEquipoCompacta from '../../components/EtiquetaEquipoCompacta';
import { useAuth } from '../../contexts/AuthContext';

export default function EquiposPage() {
  const { user } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [qrMap, setQrMap] = useState({}); // { [equipoId]: [qrs] }
  const [docMap, setDocMap] = useState({}); // { [equipoId]: cantidad }
  const [scanMap, setScanMap] = useState({}); // { [equipoId]: scanCount }
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [institutionLogo, setInstitutionLogo] = useState('/Logo-Lortech.png'); // Logo por defecto
  // Scan detail modal states
  const [scanDetailModal, setScanDetailModal] = useState(false);
  const [scanDetailEquipo, setScanDetailEquipo] = useState(null);
  const [scanLogs, setScanLogs] = useState([]);
  const [scanLogsLoading, setScanLogsLoading] = useState(false);
  const [scanLogsPage, setScanLogsPage] = useState(1);
  const [scanLogsTotal, setScanLogsTotal] = useState(0);

  // ── Filtros ──
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');

  // Preseleccionar cliente desde la URL (?clientId=) — viene desde la vista de Clientes
  useEffect(() => {
    if (router.query.clientId) setClientFilter(String(router.query.clientId));
  }, [router.query.clientId]);

  // Opciones derivadas de los equipos cargados
  const clientOptions = useMemo(() => {
    const list = Array.isArray(equipos) ? equipos : [];
    const map = new Map();
    list.forEach((e) => { if (e.client?.id) map.set(String(e.client.id), e.client.name); });
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [equipos]);

  const statusOptions = useMemo(() => {
    const list = Array.isArray(equipos) ? equipos : [];
    const set = new Set();
    list.forEach((e) => { if (e.status) set.add(e.status); });
    return Array.from(set).sort();
  }, [equipos]);

  const filteredEquipos = useMemo(() => {
    const list = Array.isArray(equipos) ? equipos : [];
    const q = search.trim().toLowerCase();
    return list.filter((e) => {
      if (clientFilter) {
        if (clientFilter === '__none__') { if (e.client?.id) return false; }
        else if (String(e.client?.id) !== clientFilter) return false;
      }
      if (statusFilter && e.status !== statusFilter) return false;
      if (q) {
        const hay = `${e.name || ''} ${e.serialNumber || ''} ${e.client?.name || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [equipos, search, statusFilter, clientFilter]);

  const hasFilters = !!(search || statusFilter || clientFilter);
  const selectedClientName = clientFilter && clientFilter !== '__none__'
    ? clientOptions.find((c) => c.id === clientFilter)?.name
    : null;
  const clearFilters = () => { setSearch(''); setStatusFilter(''); setClientFilter(''); };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments`, {
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Error al cargar equipos');
        return res.json();
      })
      .then(async (data) => {
        // La API siempre debería devolver un arreglo; si no, evitar el crash.
        if (!Array.isArray(data)) data = [];
        setEquipos(data);

        // Obtener el logo de la institución desde el primer equipo
        if (data.length > 0 && data[0].institution?.settings?.logo_url) {
          const logoUrl = data[0].institution.settings.logo_url;
          // Si la URL es relativa, agregar el prefijo del API
          if (logoUrl.startsWith('/')) {
            setInstitutionLogo(`${process.env.NEXT_PUBLIC_API_URL}/public${logoUrl}`);
          } else {
            setInstitutionLogo(logoUrl);
          }
        }
        
        // Para cada equipo, buscar sus QR y documentos
        const [qrResults, docResults] = await Promise.all([
          Promise.all(
            data.map(async (equipo) => {
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments/${equipo.id}/qrs`, {
                  credentials: 'include',
                });
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
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments/${equipo.id}/documents`, {
                  credentials: 'include',
                });
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
        // Obtener conteos de escaneos en lote
        if (data.length > 0) {
          const equipmentIds = data.map(e => e.id);
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments/scan-counts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ equipmentIds }),
          })
            .then(res => res.ok ? res.json() : {})
            .then(counts => setScanMap(counts))
            .catch(() => {});
        }
      })
      .catch(() => setError('Error al cargar los equipos'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este equipo?')) return;
    setDeletingId(id);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
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

  const handleOpenScanDetail = async (equipmentId, equipmentName) => {
    setScanDetailEquipo({ id: equipmentId, name: equipmentName });
    setScanDetailModal(true);
    setScanLogsLoading(true);
    setScanLogsPage(1);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/equipments/${equipmentId}/scan-logs?page=1&limit=20`,
        { credentials: 'include' }
      );
      if (res.ok) {
        const result = await res.json();
        setScanLogs(result.data);
        setScanLogsTotal(result.total);
      }
    } catch {}
    setScanLogsLoading(false);
  };

  const handleScanLogsPageChange = async (newPage) => {
    if (!scanDetailEquipo) return;
    setScanLogsLoading(true);
    setScanLogsPage(newPage);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/equipments/${scanDetailEquipo.id}/scan-logs?page=${newPage}&limit=20`,
        { credentials: 'include' }
      );
      if (res.ok) {
        const result = await res.json();
        setScanLogs(result.data);
        setScanLogsTotal(result.total);
      }
    } catch {}
    setScanLogsLoading(false);
  };

  return (
    <AdminLayout>
      <div className="w-full py-4 px-2 md:px-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-1">Equipos</h1>
          {/* Mini header de acciones - Solo para Admin/Super */}
          {(user?.role === 'admin' || user?.role === 'super') && (
            <div className="flex items-center gap-2 bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-1.5 mb-1">
              <Link href="/admin/equipos/nuevo" className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md shadow font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-300" title="Nuevo equipo">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Nuevo equipo
              </Link>
              <Link href="/admin/equipos/enroll" className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md shadow font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-300" title="Enrolar con QR pre-generado">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" /></svg>
                Enrolar con QR
              </Link>
              <Link href="/admin/qr/generate" className="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md shadow font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-300" title="Generar códigos QR en lote">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" /></svg>
                Generar QR
              </Link>
            </div>
          )}
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
            <>
              {/* Barra de filtros */}
              <div className="flex flex-col md:flex-row md:items-center gap-2 p-3 border-b border-gray-100">
                <div className="relative flex-1 min-w-0">
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, serie o cliente…" className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="py-2 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="">Todos los estados</option>
                  {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="py-2 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 max-w-[220px]">
                  <option value="">Todos los clientes</option>
                  <option value="__none__">Sin cliente</option>
                  {clientOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {hasFilters && (
                  <button onClick={clearFilters} className="py-2 px-3 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">Limpiar</button>
                )}
                <span className="text-xs text-gray-400 md:ml-1 whitespace-nowrap">{filteredEquipos.length} de {equipos.length}</span>
              </div>
              {filteredEquipos.length === 0 ? (
                <div className="py-16 text-center text-gray-400">No hay equipos que coincidan con los filtros.</div>
              ) : (
              <div className="w-full overflow-hidden">
              <table className="w-full table-fixed divide-y divide-gray-200">
                <colgroup>
                  <col style={{ width: '24%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '26%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '8%' }} />
                </colgroup>
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Equipo</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Última actividad</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">QR</th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Scans</th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredEquipos.map(equipo => (
                    <tr key={equipo.id} className="hover:bg-blue-50/40 transition group">

                      {/* EQUIPO — nombre + N/S como subtítulo */}
                      <td className="px-3 py-3 max-w-0">
                        <p
                          className="truncate font-semibold text-sm text-gray-900 group-hover:text-blue-700 transition"
                          title={equipo.name}
                        >
                          {equipo.name}
                        </p>
                        <p className="truncate text-xs text-gray-400" title={equipo.serialNumber || ''}>
                          {equipo.serialNumber ? `N/S: ${equipo.serialNumber}` : 'Sin N/S'}
                        </p>
                      </td>

                      {/* CLIENTE — trunca, tooltip con nombre completo */}
                      <td className="px-3 py-3 max-w-0">
                        {equipo.client?.name ? (
                          <p
                            className="truncate text-sm text-gray-600 font-medium"
                            title={equipo.client.name}
                          >
                            {equipo.client.name}
                          </p>
                        ) : (
                          <span className="text-gray-400 text-xs">No asignado</span>
                        )}
                      </td>

                      {/* ÚLTIMA ACTIVIDAD */}
                      <td className="px-3 py-3 max-w-0">
                        <EquipoLastActivity activity={equipo.lastActivity} />
                      </td>

                      {/* ESTADO */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          equipo.status === 'activo'
                            ? 'bg-green-100 text-green-700'
                            : equipo.status === 'inactivo'
                              ? 'bg-gray-200 text-gray-500'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {equipo.status || '—'}
                        </span>
                      </td>

                      {/* QR + docs */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        {Array.isArray(qrMap[equipo.id]) && qrMap[equipo.id].length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {qrMap[equipo.id].map((qr, idx) => (
                              <div key={qr.token || idx} className="flex items-center gap-1">
                                <Link href={`/qr/${qr.token}`} title="Ver detalle y documentos">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs font-bold">
                                    <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
                                    {docMap[equipo.id] || 0}
                                  </span>
                                </Link>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      {/* ESCANEOS */}
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleOpenScanDetail(equipo.id, equipo.name)}
                          className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold transition cursor-pointer"
                          title="Ver detalle de escaneos"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {scanMap[equipo.id] || 0}
                        </button>
                      </td>

                      {/* ACCIONES */}
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <EquipmentActionsDropdown
                          equipo={equipo}
                          deletingId={deletingId}
                          handleDelete={handleDelete}
                          qrs={qrMap[equipo.id] || []}
                          isOpen={activeDropdown === equipo.id}
                          setIsOpen={setActiveDropdown}
                          institutionLogo={institutionLogo}
                          role={user?.role}
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

      {/* Modal de detalle de escaneos */}
      {scanDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Escaneos QR</h2>
                <p className="text-sm text-gray-500">{scanDetailEquipo?.name} — {scanLogsTotal} escaneos totales</p>
              </div>
              <button onClick={() => setScanDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabla de logs */}
            <div className="overflow-auto flex-1 px-6 py-4">
              {scanLogsLoading ? (
                <p className="text-center text-gray-400 py-8">Cargando...</p>
              ) : scanLogs.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No hay escaneos registrados</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase">
                      <th className="pb-2">Fecha</th>
                      <th className="pb-2">Tipo</th>
                      <th className="pb-2">IP</th>
                      <th className="pb-2">Búsqueda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {scanLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="py-2 pr-4">{new Date(log.scannedAt).toLocaleString('es-CL')}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            log.searchType === 'direct'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {log.searchType === 'direct' ? 'Directo' : 'Universal'}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-gray-500 font-mono text-xs">{log.ip}</td>
                        <td className="py-2 text-gray-500">{log.searchQuery || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Paginación */}
            {scanLogsTotal > 20 && (
              <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
                <span className="text-xs text-gray-500">
                  Página {scanLogsPage} de {Math.ceil(scanLogsTotal / 20)}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={scanLogsPage <= 1}
                    onClick={() => handleScanLogsPageChange(scanLogsPage - 1)}
                    className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                  >Anterior</button>
                  <button
                    disabled={scanLogsPage >= Math.ceil(scanLogsTotal / 20)}
                    onClick={() => handleScanLogsPageChange(scanLogsPage + 1)}
                    className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                  >Siguiente</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// Fecha relativa ("hace 3 días")
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

// Celda compacta de "Última actividad" para la tabla de equipos
function EquipoLastActivity({ activity }) {
  if (!activity) return <span className="text-xs text-gray-400 italic">Sin actividad</span>;
  const isMant = activity.type === 'mantención';
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: isMant ? '#dbeafe' : '#f1f5f9', color: isMant ? '#1d4ed8' : '#475569' }}
      >
        {isMant ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" /></svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
        )}
      </span>
      <div className="min-w-0">
        <p className={`text-xs font-semibold truncate ${isMant ? 'text-blue-700' : 'text-slate-600'}`}>
          {isMant ? 'Mantención' : 'Documento'}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {timeAgo(activity.date)}{activity.responsable ? ` · ${activity.responsable}` : ''}
        </p>
      </div>
    </div>
  );
}

// Dropdown de acciones para cada equipo (fuera del componente principal)
function EquipmentActionsDropdown({ equipo, deletingId, handleDelete, qrs, isOpen, setIsOpen, institutionLogo, role }) {
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const etiquetaRef = useRef(null);
  const etiquetaCompactaRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [isUp, setIsUp] = useState(false);

  const handleDownloadEtiqueta = async () => {
    if (!etiquetaRef.current) return;

    const canvas = await html2canvas(etiquetaRef.current, {
      scale: 3, // Aumentar la escala para mayor resolución
      useCORS: true,
      backgroundColor: null,
    });

    const link = document.createElement('a');
    link.download = `etiqueta-${equipo.name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsOpen(null);
  };

  const handleDownloadEtiquetaCompacta = async () => {
    if (!etiquetaCompactaRef.current) return;

    const canvas = await html2canvas(etiquetaCompactaRef.current, {
      scale: 4, // Más escala por ser una etiqueta pequeña (mantiene nitidez al imprimir)
      useCORS: true,
      backgroundColor: null,
    });

    const link = document.createElement('a');
    link.download = `etiqueta-compacta-${equipo.name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsOpen(null);
  };

  const handleToggle = (e) => {
    if (!isOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const isUpNow = spaceBelow < 250; // Aumentado para asegurar espacio para el menú de ~220px
      setIsUp(isUpNow);
      
      // Calculamos la posición fija
      setCoords({
        top: isUpNow ? rect.top : rect.bottom,
        left: rect.right - 224, // 224px es el ancho del dropdown (w-56 = 14rem = 224px)
      });
    }
    setIsOpen(isOpen ? null : equipo.id);
  };

  // Cerrar el menú al hacer click fuera, scroll o resize
  useEffect(() => {
    function handleEvent(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(null);
      }
    }
    
    function handleScrollResize() {
      if (isOpen) setIsOpen(null);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleEvent);
      window.addEventListener('scroll', handleScrollResize, true);
      window.addEventListener('resize', handleScrollResize);
    }
    return () => {
      document.removeEventListener('mousedown', handleEvent);
      window.removeEventListener('scroll', handleScrollResize, true);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [isOpen, setIsOpen]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
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
        <div 
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: isUp ? 'auto' : coords.top + 8,
            bottom: isUp ? (window.innerHeight - coords.top) + 8 : 'auto',
            left: coords.left,
            zIndex: 9999,
          }}
          className="w-56 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in duration-100"
        >
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button
              onClick={handleDownloadEtiqueta}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-semibold w-full text-left"
              title="Descargar Etiqueta"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Descargar Etiqueta
            </button>
            <button
              onClick={handleDownloadEtiquetaCompacta}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-semibold w-full text-left"
              title="Descargar etiqueta compacta (para el costado del equipo)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" /></svg>
              Etiqueta compacta
            </button>
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
            {(role === 'admin' || role === 'super') && (
              <>
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
                  className={`flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 font-semibold w-full text-left ${deletingId === equipo.id ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => { setIsOpen(null); handleDelete(equipo.id); }}
                  disabled={deletingId === equipo.id}
                  aria-label="Eliminar equipo"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  {deletingId === equipo.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* Contenedor oculto para renderizar la etiqueta antes de la captura */}
      <div style={{ position: 'fixed', top: '-2000px', left: 0 }}>
        {qrs.length > 0 && (
          <>
            <div ref={etiquetaRef}>
              <EtiquetaEquipo
                nombre={equipo.name}
                numeroSerie={equipo.serialNumber}
                qrValue={`${window.location.origin}/qr/${qrs[0].token}`}
                logoUrl={institutionLogo}
              />
            </div>
            <div ref={etiquetaCompactaRef}>
              <EtiquetaEquipoCompacta
                nombre={equipo.name}
                numeroSerie={equipo.serialNumber}
                qrValue={`${window.location.origin}/qr/${qrs[0].token}`}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
