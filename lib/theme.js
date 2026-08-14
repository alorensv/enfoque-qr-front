/**
 * Theming por dominio (white-label ligero).
 *
 * Cada institución/cliente puede tener su color primario. Se resuelve por el
 * hostname del navegador y se aplica sobre-escribiendo las variables CSS
 * `--color-primary*` (ver docs/design-system-enfoque-qr.md). Toda la UI que usa
 * esas variables (sidebar, header, login, cards del dashboard) cambia sola.
 *
 * Para agregar un cliente: define su tema en THEMES y mapea su dominio en
 * DOMAIN_THEME. (A futuro esto podría venir de institution_settings.)
 */
export const THEMES = {
  // Marca base Enfoque QR
  default: {
    primary: '#059669',
    hover: '#047857',
    strong: '#065f46',
    soft: '#ecfdf5',
    soft2: '#d1fae5',
    p500: '#10b981',
  },
  // Lortech — conserva su azul corporativo (royal blue del swatch)
  lortech: {
    primary: '#3b5bdb',
    hover: '#3049b5',
    strong: '#22307a',
    soft: '#eef2ff',
    soft2: '#dbe4ff',
    p500: '#5c7cfa',
  },
};

/** hostname (sin www/puerto) → clave de THEMES */
export const DOMAIN_THEME = {
  'equipos-lortech.cl': 'lortech',
};

/** Devuelve la clave de tema para un hostname dado. */
export function resolveThemeKey(hostname) {
  if (!hostname) return 'default';
  const host = String(hostname).toLowerCase().split(':')[0].replace(/^www\./, '');
  if (DOMAIN_THEME[host]) return DOMAIN_THEME[host];
  // Coincidencia por sufijo (subdominios del cliente)
  const hit = Object.keys(DOMAIN_THEME).find((d) => host === d || host.endsWith('.' + d));
  return hit ? DOMAIN_THEME[hit] : 'default';
}

/** Aplica las variables CSS del tema al documento. */
export function applyTheme(themeKey) {
  if (typeof document === 'undefined') return;
  const t = THEMES[themeKey] || THEMES.default;
  const root = document.documentElement;
  root.style.setProperty('--color-primary', t.primary);
  root.style.setProperty('--color-primary-hover', t.hover);
  root.style.setProperty('--color-primary-strong', t.strong);
  root.style.setProperty('--color-primary-soft', t.soft);
  root.style.setProperty('--color-primary-soft2', t.soft2);
  root.style.setProperty('--color-primary-500', t.p500);
  root.setAttribute('data-theme', themeKey);
}
