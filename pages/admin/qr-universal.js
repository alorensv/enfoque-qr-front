import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import withAuth from '../../contexts/withAuth';
import { useAuth } from '../../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function QRUniversalManager() {
  const { user } = useAuth();
  const [institution, setInstitution] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [universalQRUrl, setUniversalQRUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.institutionId) return;
    
    const fetchData = async () => {
      try {
        // Cargar datos de la institución
        const response = await fetch(`${API_URL}/institutions/${user.institutionId}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setInstitution(data);
          
          // Obtener logo de settings si existe
          if (data.settings && data.settings.logo_url) {
            setLogoUrl(data.settings.logo_url);
          }
          
          // Generar URL del QR universal
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
          setUniversalQRUrl(`${baseUrl}/qr/universal/${data.slug}`);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDownloadQR = () => {
    // Obtener el SVG del QR
    const svg = document.getElementById('universal-qr-svg');
    if (!svg) return;

    // Convertir SVG a data URL
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Crear canvas para convertir a PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Tamaño aumentado para incluir logo y márgenes
    const qrSize = 300;
    const logoSize = 80;
    const padding = 40;
    const totalHeight = logoUrl ? qrSize + logoSize + padding * 3 : qrSize + padding * 2;
    
    canvas.width = qrSize + padding * 2;
    canvas.height = totalHeight;
    
    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let yOffset = padding;
      
      // Si hay logo, dibujarlo primero
      if (logoUrl) {
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.onload = () => {
          // Calcular dimensiones proporcionales del logo
          const logoAspectRatio = logo.width / logo.height;
          let drawWidth = logoSize;
          let drawHeight = logoSize;
          
          if (logoAspectRatio > 1) {
            drawHeight = logoSize / logoAspectRatio;
          } else {
            drawWidth = logoSize * logoAspectRatio;
          }
          
          // Centrar el logo
          const logoX = (canvas.width - drawWidth) / 2;
          ctx.drawImage(logo, logoX, yOffset, drawWidth, drawHeight);
          
          // Dibujar QR debajo del logo
          yOffset += logoSize + padding;
          ctx.drawImage(img, padding, yOffset, qrSize, qrSize);
          
          // Descargar
          downloadCanvas();
        };
        logo.onerror = () => {
          // Si el logo falla, solo dibujar el QR
          ctx.drawImage(img, padding, yOffset, qrSize, qrSize);
          downloadCanvas();
        };
        const fullLogoUrl = logoUrl.startsWith('http') ? logoUrl : `${API_URL}${logoUrl}`;
        logo.src = fullLogoUrl;
      } else {
        // Sin logo, solo QR
        ctx.drawImage(img, padding, yOffset, qrSize, qrSize);
        downloadCanvas();
      }
      
      function downloadCanvas() {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = `qr-universal-${institution.slug}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(url);
        });
        
        URL.revokeObjectURL(svgUrl);
      }
    };

    img.src = svgUrl;
  };

  const handlePrintQR = () => {
    window.print();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ color: '#64748b' }}>Cargando...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!institution) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ color: '#ef4444' }}>Error: No se pudo cargar la información de la institución</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '2rem' }}>
          QR Universal de Búsqueda
        </h1>

        <div style={{ background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '12px', padding: '2rem' }}>
          
          {/* Información de la institución */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
              {institution.name}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '1rem' }}>
              Este código QR permite buscar equipos de tu institución por número de serie.
              Los usuarios solo podrán acceder a equipos que pertenezcan a{' '}
              <strong>{institution.name}</strong>.
            </p>
            <div style={{
              background: '#eff6ff',
              borderLeft: '4px solid #3b82f6',
              padding: '1rem',
              marginTop: '1rem',
              borderRadius: '4px'
            }}>
              <p style={{ fontSize: '0.9rem', color: '#1e40af', margin: 0 }}>
                <strong>🔒 Seguridad:</strong> Cada institución tiene su propio QR universal.
                Esto garantiza el aislamiento de datos entre instituciones.
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="print-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
            {logoUrl && (
              <div style={{ marginBottom: '1rem' }}>
                <img 
                  src={logoUrl.startsWith('http') ? logoUrl : `${API_URL}${logoUrl}`} 
                  alt={institution.name} 
                  style={{ height: '80px', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
            <div style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)',
              border: '2px solid #e5e7eb'
            }}>
              <QRCodeSVG
                id="universal-qr-svg"
                value={universalQRUrl}
                size={300}
                level="H"
                includeMargin={true}
              />
            </div>
            <p style={{
              fontSize: '0.85rem',
              color: '#6b7280',
              marginTop: '1rem',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              textAlign: 'center',
              maxWidth: '500px'
            }}>
              {universalQRUrl}
            </p>
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
            <button
              onClick={handleDownloadQR}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
            >
              📥 Descargar QR
            </button>
            <button
              onClick={handlePrintQR}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#10b981',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
              onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
            >
              🖨️ Imprimir
            </button>
            <button
              onClick={() => window.open(universalQRUrl, '_blank')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6b7280',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(107,114,128,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#4b5563'}
              onMouseOut={(e) => e.currentTarget.style.background = '#6b7280'}
            >
              🔗 Probar Búsqueda
            </button>
          </div>

          {/* Instrucciones de uso */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
              💡 ¿Dónde colocar este QR?
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Entrada de bodega o taller',
                'Área de recepción',
                'Pizarra informativa',
                'Manuales de trabajo impresos',
                'Escritorio de supervisores'
              ].map((item, index) => (
                <li key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ marginRight: '0.5rem', color: '#3b82f6' }}>✓</span>
                  <span style={{ color: '#1e40af', fontSize: '0.9rem' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Diferenciación con QR específico */}
          <div style={{
            marginTop: '1.5rem',
            background: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
              ⚡ QR Universal vs QR Específico
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <p style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>QR Específico:</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#78350f' }}>
                  <li style={{ marginBottom: '0.25rem' }}>• Pegado en cada equipo</li>
                  <li style={{ marginBottom: '0.25rem' }}>• Acceso directo e inmediato</li>
                  <li style={{ marginBottom: '0.25rem' }}>• Ideal para inspecciones</li>
                </ul>
              </div>
              <div>
                <p style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>QR Universal:</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#78350f' }}>
                  <li style={{ marginBottom: '0.25rem' }}>• Un QR para todos los equipos</li>
                  <li style={{ marginBottom: '0.25rem' }}>• Requiere ingresar N° de serie</li>
                  <li style={{ marginBottom: '0.25rem' }}>• Ideal para consultas sin acceso físico</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Estilos de impresión */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-section, .print-section * {
              visibility: visible;
            }
            .print-section {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
            }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}

export default withAuth(QRUniversalManager);
