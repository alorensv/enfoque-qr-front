import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import withAuth from '../../contexts/withAuth';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

function AdminHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    equipments: 0,
    clients: 0,
    users: 0,
    scans: 0,
    equipmentsWithDocs: 0,
    equipmentsWithMaintenances: 0,
    topClients: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard stats:', err);
        setLoading(false);
      });
  }, []);

  const kpiCards = [
    {
      title: 'Equipos Totales',
      value: stats.equipments,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="2" y="4" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 18v3" />
        </svg>
      ),
      color: 'blue',
      href: '/admin/equipos'
    },
    {
      title: 'Escaneos Totales',
      value: stats.scans,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      ),
      color: 'amber',
      href: '/admin/equipos'
    },
    {
      title: 'Con Documentación',
      value: stats.equipmentsWithDocs,
      percent: stats.equipments > 0 ? Math.round((stats.equipmentsWithDocs / stats.equipments) * 100) : 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 00 2 2h12a2 2 0 00 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
      color: 'indigo',
      href: '/admin/documents'
    },
    {
      title: 'Con Mantención',
      value: stats.equipmentsWithMaintenances,
      percent: stats.equipments > 0 ? Math.round((stats.equipmentsWithMaintenances / stats.equipments) * 100) : 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 1 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 1 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
      color: 'emerald',
      href: '/admin/mantenciones'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Seccion */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Institucional
            </h1>
            <p className="mt-1 text-slate-500">
              Bienvenido, <span className="font-semibold text-blue-600">{user?.userProfile?.firstName || user?.email || 'Usuario'}</span>. Resumen operativo de hoy.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/equipos/nuevo" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors">
              + Nuevo Equipo
            </Link>
          </div>
        </div>

        {/* Grid de KPIs Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {kpiCards.map((card) => (
            <Link key={card.title} href={card.href} className="group">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full relative overflow-hidden">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0 ${colorClasses[card.color]}`}>
                    {card.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="text-3xl font-black text-slate-900 leading-none">
                      {loading ? '...' : card.value}
                    </span>
                    <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 truncate">
                      {card.title}
                    </h3>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  {card.percent !== undefined ? (
                    <span className="text-xs font-bold text-slate-400">
                      {card.percent}% de cobertura
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-blue-500">
                      Total Activos
                    </span>
                  )}
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                </div>

                {/* Indicador visual de progreso en la base de la tarjeta */}
                {card.percent !== undefined && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                    <div 
                      className={`h-1 transition-all duration-1000 ${card.color === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${card.percent}%` }}
                    />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Secciones Inferiores */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Ranking de Clientes */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                Top Clientes con más Equipos
              </h2>
              <Link href="/admin/clientes" className="text-sm font-bold text-blue-600 hover:underline">Ver todos</Link>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl" />)}
                </div>
              ) : stats?.topClients?.length > 0 ? (
                stats.topClients.map((client, idx) => (
                  <div key={client?.id || idx} className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-sm group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{client?.name || 'Cliente sin nombre'}</h4>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Cliente Registrado</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">{client?.count || 0}</span>
                      <span className="text-[10px] block font-bold text-slate-400 uppercase leading-none">Equipos</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-slate-400 italic">No hay datos de clientes registrados aún.</p>
              )}
            </div>
          </div>

          {/* Estado de Digitalización y Acciones */}
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
               </div>
               <h3 className="text-lg font-bold mb-2">Resumen General</h3>
               <div className="space-y-4 mt-6">
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-slate-400">Usuarios Totales</span>
                   <span className="font-bold">{stats.users}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-slate-400">Clientes Totales</span>
                   <span className="font-bold">{stats.clients}</span>
                 </div>
                 <hr className="border-slate-800" />
                 <div className="pt-2">
                   <div className="flex justify-between text-xs font-bold uppercase mb-2">
                     <span className="text-blue-400">Eficiencia QR</span>
                     <span>{stats.equipments > 0 ? Math.round((stats.scans / stats.equipments) * 10) / 10 : 0} p/e</span>
                   </div>
                   <div className="w-full bg-slate-800 rounded-full h-1.5">
                     <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '65%' }} />
                   </div>
                 </div>
               </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <h3 className="text-blue-900 font-bold mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Próximos Pasos
              </h3>
              <ul className="text-sm text-blue-700 space-y-3 font-medium">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  Completa la documentación del 100% de tus equipos.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  Registra tu primera mantención clínica preventiva.
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}

export default withAuth(AdminHome);


