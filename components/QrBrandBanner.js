import Logo from './Logo';

/**
 * Banner superior de la ficha pública del equipo (y de sus mantenciones).
 * El color/logo sigue la marca de la INSTITUCIÓN DUEÑA DEL EQUIPO (no el
 * dominio desde el que se mira la página — un QR puede escanearse desde
 * cualquier lado): Lortech conserva su logo real y su azul corporativo;
 * cualquier otra institución usa el logo genérico de Enfoque QR con el
 * color primario ya resuelto por el caller (ver lib/theme.js).
 */
export default function QrBrandBanner({ isLortech }) {
  if (isLortech) {
    return (
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 px-4 sm:px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <img
            src="/logo_lortech_blanco.png"
            alt="Lortech"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain"
          />
        </div>
        <button
          onClick={() => window.open('https://lortech.cl/contacto/', '_blank')}
          className="bg-white hover:bg-gray-100 text-blue-900 font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Cotizar</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[var(--color-primary-strong)] via-[var(--color-primary)] to-[var(--color-primary-strong)] px-4 sm:px-6 py-5 flex items-center shadow-md">
      <Logo theme="dark" height={40} />
    </div>
  );
}
