/**
 * Logo.js — Componente reutilizable del logo de Enfoque QR
 *
 * Paleta del proyecto:
 *   Azul primario : #2563eb / #1e40af
 *   Azul claro    : #60a5fa / #93c5fd
 *   Indigo        : #818cf8
 *   Verde activo  : #22c55e
 *   Oscuro        : #0f172a / #1e293b
 *
 * Props:
 *  - variant : 'full' | 'icon'    → con o sin texto  (default: 'full')
 *  - theme   : 'dark' | 'light'   → header / login   (default: 'dark')
 *  - height  : número en px       → alto del SVG     (default: 48)
 */
export default function Logo({ variant = 'full', theme = 'dark', height = 48 }) {
  const isIcon   = variant === 'icon';
  const isDark   = theme === 'dark';

  // ── Colores según contexto ────────────────────────────────────────
  const bgQR        = isDark ? '#0f172a'               : '#eff6ff';   // fondo bloque QR
  const strokeQR    = isDark ? '#2563eb'               : '#2563eb';   // borde exterior
  const fillCorner  = '#2563eb';                                       // esquinas QR (azul primario)
  const fillCenter  = '#818cf8';                                       // módulos centro (indigo)
  const crossColor  = '#22c55e';                                       // crosshair (verde activo)
  const textMain    = isDark ? '#f1f5f9'               : '#1e293b';   // texto principal
  const textSub     = isDark ? '#60a5fa'               : '#2563eb';   // subtext (azul claro / primario)

  // ── Dimensiones ───────────────────────────────────────────────────
  const iconSize = 48;
  const gap      = 10;
  const viewW    = isIcon ? iconSize : iconSize + gap + 128;
  const viewH    = iconSize;
  const scale    = height / viewH;
  const svgW     = Math.round(viewW * scale);
  const textX    = iconSize + gap;

  return (
    <svg
      width={svgW}
      height={height}
      viewBox={`0 0 ${viewW} ${viewH}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-label="Enfoque QR"
    >
      {/* ── Bloque QR ────────────────────────────────────────────── */}

      {/* Fondo redondeado */}
      <rect x="0" y="0" width={iconSize} height={iconSize} rx="9"
        fill={bgQR} stroke={strokeQR} strokeWidth="1.5" />

      {/* Esquina superior-izquierda */}
      <rect x="7"  y="7"  width="13" height="13" rx="2.5" fill={fillCorner} />
      <rect x="10" y="10" width="7"  height="7"  rx="1"   fill={bgQR} />

      {/* Esquina superior-derecha */}
      <rect x="28" y="7"  width="13" height="13" rx="2.5" fill={fillCorner} />
      <rect x="31" y="10" width="7"  height="7"  rx="1"   fill={bgQR} />

      {/* Esquina inferior-izquierda */}
      <rect x="7"  y="28" width="13" height="13" rx="2.5" fill={fillCorner} />
      <rect x="10" y="31" width="7"  height="7"  rx="1"   fill={bgQR} />

      {/* Módulos del centro (indigo) */}
      <rect x="26" y="26" width="6" height="6" rx="1" fill={fillCenter} />
      <rect x="34" y="34" width="5" height="5" rx="1" fill={fillCenter} />
      <rect x="26" y="34" width="5" height="5" rx="1" fill={fillCenter} opacity="0.6" />

      {/* Crosshair de enfoque (verde) */}
      <line x1="24" y1="0"  x2="24" y2="6"  stroke={crossColor} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="24" y1="42" x2="24" y2="48" stroke={crossColor} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="0"  y1="24" x2="6"  y2="24" stroke={crossColor} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="42" y1="24" x2="48" y2="24" stroke={crossColor} strokeWidth="1.8" strokeLinecap="round" />

      {/* ── Texto (solo en variant="full") ───────────────────────── */}
      {!isIcon && (
        <>
          {/* "Enfoque" en texto principal */}
          <text
            x={textX}
            y="27"
            fontFamily="'Urbanist', 'Inter', Arial, sans-serif"
            fontSize="18"
            fontWeight="800"
            fill={textMain}
            letterSpacing="-0.5"
          >
            Enfoque
          </text>

          {/* "QR" con color azul/indigo de acento */}
          <text
            x={textX + 78}
            y="27"
            fontFamily="'Urbanist', 'Inter', Arial, sans-serif"
            fontSize="18"
            fontWeight="800"
            fill={textSub}
            letterSpacing="-0.5"
          >
            QR
          </text>

          {/* subtítulo */}
          <text
            x={textX}
            y="41"
            fontFamily="'Urbanist', 'Inter', Arial, sans-serif"
            fontSize="10.5"
            fontWeight="500"
            fill={isDark ? '#475569' : '#64748b'}
            letterSpacing="0.4"
          >
            enfoqueqr.cl
          </text>
        </>
      )}
    </svg>
  );
}