import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import withAuth from '../../contexts/withAuth';
import { useAuth } from '../../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function QRUniversalManager() {
  const { user } = useAuth();
  const [institution, setInstitution] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [universalQRUrl, setUniversalQRUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const labelRef = useRef(null);

  useEffect(() => {
    if (!user?.institutionId) return;
    
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/institutions/${user.institutionId}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setInstitution(data);
          
          if (data.settings && data.settings.logo_url) {
            setLogoUrl(data.settings.logo_url);
          }
          
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

  const handleDownloadQR = async () => {
    if (!labelRef.current) return;

    try {
      const canvas = await html2canvas(labelRef.current, {
        scale: 3, // Alta resolución
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const url = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `etiqueta-qr-${institution?.slug || 'universal'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error('Error al descargar PNG:', error);
    }
  };
  const handleDownloadPDF = async () => {
    if (!labelRef.current) return;

    try {
      const canvas = await html2canvas(labelRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Crear PDF A4 (210 x 297 mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calcular dimensiones para que quepa en el PDF manteniendo proporción
      // El canvas original tiene 380px de ancho aproximadamente
      // Vamos a darle un ancho de 80mm en el PDF para que sea tamaño etiqueta estándar
      const imgWidth = 80; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Ubicar en la parte superior izquierda con un pequeño margen
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      
      pdf.save(`etiqueta-qr-${institution?.slug || 'universal'}.pdf`);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
    }
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

          {/* QR Design Preview / Label Section */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#f8fafc',
            padding: '3rem',
            borderRadius: '16px',
            border: '2px dashed #e2e8f0',
            marginBottom: '2rem'
          }}>
            <div 
              ref={labelRef}
              id="qr-label-professional"
              className="print-section"
              style={{
                width: '380px',
                padding: '40px 30px',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                position: 'relative'
              }}
            >
              {/* Logo de institución */}
              <div style={{ height: '70px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {logoUrl ? (
                  <img 
                    src={logoUrl.startsWith('http') ? logoUrl : `${API_URL}${logoUrl}`} 
                    alt={institution.name} 
                    crossOrigin="anonymous"
                    style={{ maxHeight: '100%', maxWidth: '200px', objectFit: 'contain' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div style={{ fontWeight: '800', fontSize: '24px', color: '#1e293b' }}>
                    {institution.name}
                  </div>
                )}
              </div>

              {/* Título Principal */}
              <h3 style={{ 
                fontSize: '19px', 
                fontWeight: '700', 
                color: '#0f172a', 
                margin: '0 0 25px 0',
                lineHeight: '1.3',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                Escanear para consultar un equipo
              </h3>

              {/* Código QR */}
              <div style={{
                padding: '12px',
                background: '#fff',
                borderRadius: '8px',
                border: '1.5px solid #f1f5f9',
                display: 'inline-block',
                marginBottom: '25px'
              }}>
                <QRCodeSVG
                  id="universal-qr-svg"
                  value={universalQRUrl}
                  size={240}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* Subtítulo / Pie de página */}
              <div style={{ borderTop: '1px solid #f1f5f9', width: '100%', paddingTop: '20px' }}>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#64748b', 
                  fontWeight: '500', 
                  margin: 0,
                  letterSpacing: '0.01em',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  Equipo registrado en <strong style={{ color: '#1e293b' }}>Lortech</strong>
                </p>
              </div>
            </div>
            
            <p style={{
              fontSize: '0.8rem',
              color: '#94a3b8',
              marginTop: '1.5rem',
              fontFamily: 'monospace'
            }}>
              URL destino: {universalQRUrl}
            </p>
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
            <button
              onClick={handleDownloadQR}
              style={{
                padding: '0.75rem 1.75rem',
                background: '#1e293b',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(30,41,59,0.25)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ fontSize: '1.2rem' }}>📥</span> Descargar Etiqueta (PNG)
            </button>
            <button
              onClick={handleDownloadPDF}
              style={{
                padding: '0.75rem 1.75rem',
                background: '#059669',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(5,150,105,0.25)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ fontSize: '1.2rem' }}>📄</span> Descargar Etiqueta (PDF)
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

        {/* Estilos de impresión optimizados para PDF */}
        <style jsx global>{`
          @media print {
            body {
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            body > * {
              display: none !important;
            }
            #qr-label-professional {
              display: flex !important;
              position: absolute !important;
              left: 50% !important;
              top: 50% !important;
              transform: translate(-50%, -50%) !important;
              box-shadow: none !important;
              border: 1px solid #eee !important;
            }
            .print-section {
              display: flex !important;
              visibility: visible !important;
            }
            .print-section * {
              visibility: visible !important;
            }
            @page {
              size: auto;
              margin: 0mm;
            }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}

export default withAuth(QRUniversalManager);
