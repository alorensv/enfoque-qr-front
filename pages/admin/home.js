import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import withAuth from '../../contexts/withAuth';
import { useAuth } from '../../contexts/AuthContext';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import KpiCard from '../../components/dashboard/KpiCard';
import TopClientsCard from '../../components/dashboard/TopClientsCard';
import GeneralSummaryCard from '../../components/dashboard/GeneralSummaryCard';
import NextStepsCard from '../../components/dashboard/NextStepsCard';

function AdminHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    equipments: 0,
    clients: 0,
    users: 0,
    scans: 0,
    equipmentsWithDocs: 0,
    equipmentsWithMaintenances: 0,
    topClients: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard stats:', err);
        setLoading(false);
      });
  }, []);

  const pct = (n) => (stats.equipments > 0 ? Math.round((n / stats.equipments) * 100) : 0);
  const efficiency = stats.equipments > 0 ? Math.round((stats.scans / stats.equipments) * 10) / 10 : 0;
  const displayName = user?.userProfile?.firstName || user?.name || user?.email || 'Usuario';

  const kpiCards = [
    {
      title: 'Equipos Totales',
      value: stats.equipments,
      tone: 'primary',
      href: '/admin/equipos',
      footerLabel: 'Total activos',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="14" rx="2" /><path d="M8 21h8M12 18v3" /></svg>
      ),
    },
    {
      title: 'Escaneos Totales',
      value: stats.scans,
      tone: 'warning',
      href: '/admin/equipos',
      footerLabel: 'Total activos',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 8v4M12 16h.01" /></svg>
      ),
    },
    {
      title: 'Con Documentación',
      value: stats.equipmentsWithDocs,
      tone: 'info',
      percent: pct(stats.equipmentsWithDocs),
      href: '/admin/documents',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
      ),
    },
    {
      title: 'Con Mantención',
      value: stats.equipmentsWithMaintenances,
      tone: 'primary',
      percent: pct(stats.equipmentsWithMaintenances),
      href: '/admin/mantenciones',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
      ),
    },
  ];

  const nextSteps = [
    {
      label: 'Completa la documentación del 100% de tus equipos.',
      href: '/admin/documents',
      done: !loading && stats.equipments > 0 && stats.equipmentsWithDocs >= stats.equipments,
    },
    {
      label: 'Registra tu primera mantención preventiva.',
      href: '/admin/mantenciones',
      done: !loading && stats.equipmentsWithMaintenances > 0,
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <WelcomeBanner name={displayName} />

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-6">
          {kpiCards.map((card) => (
            <KpiCard key={card.title} {...card} loading={loading} />
          ))}
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          <div className="lg:col-span-2">
            <TopClientsCard clients={stats?.topClients || []} loading={loading} />
          </div>
          <div className="flex flex-col gap-5 sm:gap-6">
            <GeneralSummaryCard
              users={stats.users}
              clients={stats.clients}
              efficiency={efficiency}
              loading={loading}
            />
            <NextStepsCard steps={nextSteps} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAuth(AdminHome);
