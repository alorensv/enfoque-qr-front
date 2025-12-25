import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Enfoque QR - Landing</title>
        <meta name="description" content="Landing page de Enfoque QR" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '1rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          padding: '3rem 2rem',
          maxWidth: 420,
          textAlign: 'center',
        }}>
          <img src="/logo.png" alt="Enfoque QR Logo" style={{ width: 80, marginBottom: 24 }} />
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', color: '#2563eb' }}>Enfoque QR</h1>
          <p style={{ color: '#334155', fontSize: '1.1rem', marginBottom: 32 }}>
            Solución moderna para gestión y escaneo de códigos QR.<br />
            Rápido, seguro y fácil de usar.
          </p>
          <a href="#" style={{
            display: 'inline-block',
            background: '#2563eb',
            color: '#fff',
            padding: '0.75rem 2rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '1.1rem',
            boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#1d4ed8'}
          onMouseOut={e => e.currentTarget.style.background = '#2563eb'}
          >
            Comenzar
          </a>
        </div>
      </main>
    </>
  );
}
