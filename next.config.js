/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

// Origen del backend (para permitirlo en connect-src de la CSP).
let apiOrigin = "'self'";
try {
  if (process.env.NEXT_PUBLIC_API_URL) {
    apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL).origin;
  }
} catch {
  apiOrigin = "'self'";
}

// En dev se relaja connect-src para el HMR de Next (websockets a localhost).
const connectSrc = isProd
  ? `'self' ${apiOrigin}`
  : `'self' ${apiOrigin} ws: wss: http://localhost:* https://localhost:*`;

// Content-Security-Policy. script/style con 'unsafe-inline' porque la UI usa
// estilos inline de forma intensiva y un script de tema inline en _document;
// migrar a nonces es un endurecimiento posterior. El resto queda acotado.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com data:",
  `connect-src ${connectSrc}`,
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async headers() {
    // Solo en producción: en dev, Next (Turbopack/HMR) usa eval y sirve algunos
    // manifests con MIME laxo, que la CSP estricta + nosniff romperían.
    if (!isProd) return [];
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

module.exports = nextConfig;
