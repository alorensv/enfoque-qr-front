import AdminLayout from '../../components/AdminLayout';
import withAuth from '../../contexts/withAuth';

function AdminHome() {
	return (
		<AdminLayout>
			<h2 style={{ fontSize: '2rem', color: '#2563eb', marginBottom: 16 }}>Bienvenido al Panel de Administración</h2>
			<p style={{ color: '#334155', fontSize: '1.1rem', marginBottom: 32 }}>
				Selecciona una opción del menú para comenzar a gestionar el sistema Enfoque QR.
			</p>
			<div style={{
				background: '#fff',
				borderRadius: 12,
				boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
				padding: '2rem',
				maxWidth: 600,
				margin: '0 auto',
				textAlign: 'center',
			}}>
				<span style={{ fontSize: 48, color: '#2563eb' }}>🎉</span>
				<div style={{ marginTop: 16, color: '#64748b' }}>
					¡Administra usuarios, equipos, documentos y más desde este panel!
				</div>
			</div>
		</AdminLayout>
	);
}

export default withAuth(AdminHome);
