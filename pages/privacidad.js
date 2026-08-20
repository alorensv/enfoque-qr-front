import Head from 'next/head';
import Link from 'next/link';
import Logo from '../components/Logo';

const ACTUALIZADO = '16 de agosto de 2026';

function Seccion({ n, titulo, children }) {
  return (
    <section className="mb-7">
      <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-baseline gap-2">
        <span className="text-[var(--color-primary)]">{n}.</span> {titulo}
      </h2>
      <div className="text-slate-600 text-[15px] leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function Privacidad() {
  return (
    <>
      <Head>
        <title>Política de Privacidad · Enfoque QR</title>
        <meta name="description" content="Política de privacidad y tratamiento de datos personales de Enfoque QR." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-[var(--color-primary-soft)] to-slate-50 font-sans">
        {/* Header */}
        <header className="bg-white border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
            <Logo theme="light" height={40} />
            <Link href="/" className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Volver al inicio
            </Link>
          </div>
        </header>

        {/* Documento */}
        <div className="max-w-3xl mx-auto px-5 py-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 sm:p-9">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Política de Privacidad</h1>
            <p className="text-slate-400 text-sm mt-1 mb-6">Última actualización: {ACTUALIZADO}</p>

            <p className="text-slate-600 text-[15px] leading-relaxed mb-7">
              En <b>Enfoque QR</b> tratamos datos personales para operar una plataforma de
              trazabilidad de equipos mediante códigos QR. Esta política explica qué datos
              recopilamos, con qué finalidad, cómo los protegemos y qué derechos tienes,
              en línea con la <b>Ley 21.719</b> de protección de datos personales de Chile.
            </p>

            <Seccion n="1" titulo="Responsable del tratamiento">
              <p>
                Enfoque QR es operado por la institución contratante (el <b>cliente</b>) como
                responsable de los datos que carga, y por el proveedor de la plataforma como
                encargado del tratamiento. Para consultas de privacidad puedes escribir a
                <b> contacto@enfoqueqr.cl</b>.
              </p>
            </Seccion>

            <Seccion n="2" titulo="Datos que tratamos">
              <ul className="list-disc pl-5 space-y-1">
                <li><b>Datos de cuenta:</b> nombre, correo electrónico, teléfono y rol del usuario.</li>
                <li><b>Datos operativos</b> cargados por la institución: equipos, clientes, mantenciones y documentos.</li>
                <li><b>Registros de escaneo QR:</b> fecha/hora, dirección IP y agente del navegador al escanear un código.</li>
                <li><b>Archivos y documentos</b> asociados a cada equipo (que pueden ser públicos o privados; ver punto 3).</li>
              </ul>
            </Seccion>

            <Seccion n="3" titulo="Documentos públicos y privados">
              <p>
                La plataforma distingue dos niveles de visibilidad, definidos por la propia
                institución:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <b>Públicos:</b> los documentos que la institución marca como públicos quedan
                  accesibles para <b>cualquier persona que escanee el código QR</b> del equipo,
                  sin necesidad de iniciar sesión. Es el propósito del producto (consulta
                  abierta de información del equipo).
                </li>
                <li>
                  <b>Privados:</b> el resto de la información requiere <b>autenticación</b> y solo
                  es accesible por usuarios de la misma institución.
                </li>
              </ul>
              <p>
                Recomendamos no marcar como públicos documentos que contengan datos personales
                o información sensible.
              </p>
            </Seccion>

            <Seccion n="4" titulo="Aislamiento entre instituciones (multi-tenant)">
              <p>
                Cada institución accede <b>únicamente</b> a sus propios datos. La información de
                una institución no es visible para otra. El aislamiento se aplica en todas las
                consultas de la aplicación.
              </p>
            </Seccion>

            <Seccion n="5" titulo="Finalidad y base de licitud">
              <p>
                Tratamos los datos para prestar el servicio (gestión y trazabilidad de equipos),
                sobre la base de la <b>ejecución del contrato</b> con la institución y del
                <b> interés legítimo</b> en operar y asegurar la plataforma. Cuando corresponda,
                solicitaremos tu <b>consentimiento</b>.
              </p>
            </Seccion>

            <Seccion n="6" titulo="Dónde se almacenan los datos">
              <p>
                La base de datos se aloja en <b>Google Cloud (GCP)</b> y los archivos en
                <b> Amazon S3 (AWS)</b>. Parte de la infraestructura se ubica fuera de Chile, por
                lo que puede existir <b>transferencia internacional de datos</b>, realizada con
                las garantías adecuadas. El tráfico viaja cifrado (HTTPS/TLS).
              </p>
            </Seccion>

            <Seccion n="7" titulo="Cookies">
              <p>
                Usamos una <b>cookie de sesión</b> técnica (httpOnly) para mantener tu inicio de
                sesión. No usamos cookies de publicidad ni de seguimiento de terceros.
              </p>
            </Seccion>

            <Seccion n="8" titulo="Conservación">
              <p>
                Conservamos los datos mientras exista la cuenta o la relación con la institución,
                y por los plazos legales aplicables. Luego se eliminan o anonimizan.
              </p>
            </Seccion>

            <Seccion n="9" titulo="Tus derechos">
              <p>
                Conforme a la Ley 21.719 puedes ejercer tus derechos de <b>acceso, rectificación,
                supresión, oposición, portabilidad y bloqueo</b> de tus datos. Para ello escribe a
                <b> contacto@enfoqueqr.cl</b> indicando tu solicitud; responderemos en los plazos
                que fija la ley. También tienes derecho a reclamar ante la Agencia de Protección
                de Datos Personales.
              </p>
            </Seccion>

            <Seccion n="10" titulo="Seguridad">
              <p>
                Aplicamos medidas técnicas y organizativas: cifrado en tránsito, control de
                acceso por rol, aislamiento por institución, contraseñas almacenadas con
                <b> hashing</b> (bcrypt) y una política de contraseñas robustas.
              </p>
            </Seccion>

            <Seccion n="11" titulo="Cambios a esta política">
              <p>
                Podemos actualizar esta política. Publicaremos la nueva versión en esta página con
                su fecha de actualización.
              </p>
            </Seccion>

            <Seccion n="12" titulo="Contacto">
              <p>
                Dudas o solicitudes de privacidad: <b>contacto@enfoqueqr.cl</b>.
              </p>
            </Seccion>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
              Este documento es informativo y puede complementarse con el aviso de privacidad
              específico de cada institución.
            </div>
          </div>

          <div className="text-center mt-6">
            <Link href="/" className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">← Volver al inicio</Link>
          </div>
        </div>
      </main>
    </>
  );
}
