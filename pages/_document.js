import { Html, Head, Main, NextScript } from 'next/document';
import { THEMES, DOMAIN_THEME } from '../lib/theme';

/**
 * Script bloqueante que aplica el tema por dominio ANTES del primer paint,
 * evitando el parpadeo (FOUC) del color primario. La lógica se serializa desde
 * lib/theme.js para mantener una sola fuente de verdad.
 */
const themeBootstrap = `
(function(){
  try {
    var THEMES = ${JSON.stringify(THEMES)};
    var MAP = ${JSON.stringify(DOMAIN_THEME)};
    var host = location.hostname.toLowerCase().replace(/^www\\./,'');
    var key = MAP[host];
    if (!key) {
      key = Object.keys(MAP).find(function(d){ return host === d || host.endsWith('.'+d); });
    }
    var t = THEMES[key] || THEMES.default;
    var r = document.documentElement;
    r.style.setProperty('--color-primary', t.primary);
    r.style.setProperty('--color-primary-hover', t.hover);
    r.style.setProperty('--color-primary-strong', t.strong);
    r.style.setProperty('--color-primary-soft', t.soft);
    r.style.setProperty('--color-primary-soft2', t.soft2);
    r.style.setProperty('--color-primary-500', t.p500);
    r.setAttribute('data-theme', key || 'default');
  } catch (e) {}
})();
`;

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
