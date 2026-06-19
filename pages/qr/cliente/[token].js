import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const API = process.env.NEXT_PUBLIC_API_URL;
const DAY = 86400000;

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-CL');
}

function timeAgo(value) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  if (diff < DAY) return 'hoy';
  const days = Math.floor(diff / DAY);
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  const years = Math.floor(months / 12);
  return `hace ${years} ${years === 1 ? 'año' : 'años'}`;
}

function statusBadge(status) {
  if (status === 'activo') return 'bg-green-100 text-green-800';
  if (status === 'inactivo') return 'bg-gray-200 text-gray-600';
  return 'bg-yellow-100 text-yellow-800';
}

function resolveLogo(logoUrl) {
  if (!logoUrl) return '';
  return logoUrl.startsWith('http') ? logoUrl : `${API}${logoUrl}`;
}

// Color de acento de la institución (cae a azul si es negro/blanco/no válido).
function pickAccent(color) {
  if (!color) return '#2563eb';
  const hex = color.startsWith('#') ? color : `#${color}`;
  if (/^#(000000|ffffff)$/i.test(hex)) return '#2563eb';
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#2563eb';
}

export default function ClientePublicoPage() {
  const router = useRouter();
  const { token } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API}/public/clients/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error('Código QR inválido o cliente no encontrado');
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message || 'No se pudo cargar la información'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando información...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return null;

  const { client, institution, equipments = [] } = data;
  const logo = resolveLogo(institution?.logoUrl);
  const accent = pickAccent(institution?.primaryColor);

  // ── Métricas ──
  const totalDocs = equipments.reduce((acc, e) => acc + (e.documents?.length || 0), 0);
  const now = Date.now();
  const recentCount = equipments.reduce(
    (acc, e) =>
      acc +
      (e.maintenances || []).filter((m) => {
        const t = new Date(m.performedAt).getTime();
        return !isNaN(t) && now - t <= 30 * DAY;
      }).length,
    0,
  );
  const activos = equipments.filter((e) => e.status === 'activo').length;
  const sinMantencion = equipments.filter((e) => !(e.maintenances?.length)).length;

  // ── Feed de actividad reciente (mantenciones + documentos) ──
  const activities = [];
  equipments.forEach((e) => {
    (e.maintenances || []).forEach((m) =>
      activities.push({ id: `m${m.id}`, kind: 'mant', date: m.performedAt, equipment: e.name, title: m.description || 'Mantención registrada', status: m.status }),
    );
    (e.documents || []).forEach((d) =>
      activities.push({ id: `d${d.id}`, kind: 'doc', date: d.createdAt, equipment: e.name, title: d.name }),
    );
  });
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentActivities = activities.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <Head>
        <title>{client?.name ? `${client.name} · Equipos` : 'Equipos'}</title>
      </Head>

      {/* Banner */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-md pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
          <p className="text-blue-200 text-xs sm:text-sm uppercase tracking-widest mb-1">Panel de equipos</p>
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            {client?.name}
          </h1>
          <p className="text-blue-200 text-sm mt-2">Documentación y mantenciones de tus equipos</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* KPIs (superpuestos al banner) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 -mt-10">
          <KpiCard
            label="Documentos"
            value={totalDocs}
            sub="disponibles"
            accent={accent}
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />}
          />
          <KpiCard
            label="Actividad"
            value={recentCount}
            sub="últimos 30 días"
            accent={accent}
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />}
          />
          <KpiCard
            label="Operativos"
            value={`${activos}/${equipments.length}`}
            sub="equipos activos"
            accent={accent}
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
          />
          <KpiCard
            label="Sin mantención"
            value={sinMantencion}
            sub="requieren atención"
            accent={sinMantencion > 0 ? '#dc2626' : accent}
            valueColor={sinMantencion > 0 ? '#dc2626' : undefined}
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />}
          />
        </div>

        {/* Equipos */}
        <div className="mt-10">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">
            Equipos <span className="text-gray-400 font-semibold">({equipments.length})</span>
          </h2>
          {equipments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
              Este cliente todavía no tiene equipos registrados.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipments.map((eq) => (
                <EquipmentSummaryCard key={eq.id} eq={eq} accent={accent} onOpen={() => setSelected(eq)} />
              ))}
            </div>
          )}
        </div>

        {/* Actividad reciente */}
        {recentActivities.length > 0 && (
          <div className="mt-10">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">Actividad reciente</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
              {recentActivities.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${a.kind === 'mant' ? accent : '#64748b'}1a`, color: a.kind === 'mant' ? accent : '#475569' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      {a.kind === 'mant' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      )}
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-800 truncate">
                      {a.kind === 'mant' ? 'Mantención' : 'Documento'} · <span className="text-gray-500">{a.equipment}</span>
                    </p>
                    <p className="text-xs text-gray-400 truncate">{a.title}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(a.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-12 pt-8 border-t border-gray-200 flex flex-col items-center gap-1">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={institution?.name || 'Logo'} className="h-12 sm:h-14 w-auto object-contain" />
          ) : (
            <span className="text-gray-600 font-bold text-lg">{institution?.name}</span>
          )}
        </footer>
      </main>

      {selected && <EquipmentDetailModal eq={selected} accent={accent} onClose={() => setSelected(null)} />}
    </div>
  );
}

function KpiCard({ label, value, sub, icon, accent, valueColor }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}1a`, color: accent }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">{icon}</svg>
        </span>
      </div>
      <div className="text-3xl font-extrabold mt-2 leading-none" style={{ color: valueColor || '#111827' }}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  );
}

function EquipmentThumb({ eq, size = 'w-16 h-16' }) {
  if (eq.equipmentPhoto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`${API}/equipments/${eq.id}/photo`}
        alt={eq.name}
        className={`${size} object-cover rounded-lg border-2 border-gray-200 flex-shrink-0`}
      />
    );
  }
  return (
    <div className={`${size} rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0`}>
      <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    </div>
  );
}

function EquipmentSummaryCard({ eq, onOpen, accent }) {
  // "Ver detalle" abre la ficha QR del equipo en una pestaña nueva.
  // Si el equipo no tiene QR activo, cae al modal de detalle.
  const handleClick = () => {
    if (eq.qrToken) {
      window.open(`${window.location.origin}/qr/${eq.qrToken}`, '_blank', 'noopener,noreferrer');
    } else {
      onOpen();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="text-left bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      <div className="flex gap-3 p-4">
        <EquipmentThumb eq={eq} />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 truncate">{eq.name || 'Equipo sin nombre'}</h3>
          {eq.serialNumber && <p className="text-xs text-gray-500 mt-0.5 truncate">N/S: {eq.serialNumber}</p>}
          <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(eq.status)}`}>
            {eq.status || 'sin estado'}
          </span>
        </div>
      </div>
      <div className="mt-auto border-t border-gray-100 px-4 py-2.5 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          {eq.documents?.length || 0} docs
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" /></svg>
          {eq.maintenances?.length || 0} mant.
        </span>
        <span className="font-semibold" style={{ color: accent }}>Ver detalle →</span>
      </div>
    </button>
  );
}

function EquipmentDetailModal({ eq, onClose, accent }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-grow min-w-0">
              <h1 className="text-2xl font-bold text-gray-800">{eq.name || 'Equipo sin nombre'}</h1>
              {eq.description && <p className="text-sm text-gray-500">{eq.description}</p>}
              <span className={`mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusBadge(eq.status)}`}>
                {eq.status || 'sin estado'}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <EquipmentThumb eq={eq} size="w-24 h-24" />
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Cerrar">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Detalles del Equipo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-gray-500">N/S:</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">{eq.serialNumber || '-'}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Documentación</h2>
            <ul className="space-y-2">
              {(eq.documents?.length || 0) === 0 ? (
                <li className="text-gray-500 text-sm italic">No hay documentos disponibles.</li>
              ) : (
                eq.documents.map((doc) => (
                  <li key={doc.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between gap-4 transition hover:bg-gray-100">
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(doc.createdAt)}</p>
                    </div>
                    {doc.filePath && (
                      <a
                        href={`${API}/equipments/documents/${doc.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium flex-shrink-0 hover:underline"
                        style={{ color: accent }}
                      >
                        Descargar
                      </a>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Historial de Mantenciones</h2>
            <ul className="space-y-2">
              {(eq.maintenances?.length || 0) === 0 ? (
                <li className="text-gray-500 text-sm italic">No hay mantenciones registradas.</li>
              ) : (
                eq.maintenances.map((mant) => (
                  <li key={mant.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <p className="font-semibold text-gray-800">
                      {formatDate(mant.performedAt)} - <span className="font-normal">{mant.status || 'sin estado'}</span>
                    </p>
                    {mant.description && <p className="text-xs text-gray-600 mt-1">{mant.description}</p>}
                    {mant.technician && <p className="text-xs text-gray-500 mt-0.5">Resp: {mant.technician}</p>}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
