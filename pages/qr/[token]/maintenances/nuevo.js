import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { maintenanceFormsApi } from '../../../../services/api';
import QrBrandBanner from '../../../../components/QrBrandBanner';
import { resolveThemeKeyForInstitution, themeCssVars } from '../../../../lib/theme';

/* ─── Íconos SVG inline (lineales, coherentes con el resto del front) ─── */
const Icon = {
  chevronLeft: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>,
  chevronRight: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>,
  chevronDown: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>,
  clipboard: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  wrench: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>,
  swap: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M16 3l4 4-4 4M4 7h16M8 21l-4-4 4-4M20 17H4" /></svg>,
  card: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>,
  calendar: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>,
  user: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>,
  camera: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M4 8a2 2 0 012-2h1l1.5-2h7L17 6h1a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2z" /><circle cx="12" cy="13" r="3.5" /></svg>,
  document: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  upload: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m0 0L7 9m5-5l5 5" /><path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" /></svg>,
  save: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>,
  lock: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 118 0v4" /></svg>,
  pencil: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
};

const inputCls = "w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft2)] transition placeholder:text-gray-400";
const labelCls = "text-sm font-bold text-gray-900 flex items-center gap-1 mb-1.5";
const Required = () => <span className="text-red-500">*</span>;

/**
 * Tarjeta blanca con el banner de marca del cliente (mismo banner que la
 * ficha del equipo en qr/[token].js), para que ambas pantallas se vean
 * como parte del mismo flujo. La marca depende de la institución dueña del
 * equipo (equipo.institution.slug), no del dominio desde el que se mira la
 * página — así se ve igual sin importar dónde se escaneó el QR.
 */
function BrandCard({ equipo, children }) {
  const themeKey = resolveThemeKeyForInstitution(equipo?.institution?.slug);
  const isLortech = themeKey === 'lortech';
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden" style={themeCssVars(themeKey)}>
        <QrBrandBanner isLortech={isLortech} />
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/** Encabezado + tarjeta del equipo, comunes al selector de modo y al formulario. */
function Header({ token, equipo, onBack, children }) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition flex-shrink-0"
          >
            <Icon.chevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">Nueva mantención</h1>
            <p className="text-xs text-gray-500">Registra una nueva mantención</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--color-primary-soft)]">
          <Icon.clipboard className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="w-full flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] p-4 mb-4 text-left hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--color-primary-soft)]">
            <Icon.wrench className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Equipo</p>
            <p className="font-bold text-gray-900 truncate">{equipo?.name || 'Equipo'}</p>
          </div>
        </div>
        <Icon.chevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>

      {children}
    </>
  );
}

export default function NuevaMantencion() {
  const { user } = useAuth();
  const router = useRouter();
  const { token } = router.query;
  const [equipo, setEquipo] = useState(null);
  const [validando, setValidando] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    description: '',
    performedAt: '',
    technician: '',
    status: '',
    // file_path: '', // deprecated
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const photosRef = useRef();
  const docsRef = useRef();
  // Solo para mostrar cuántos archivos se eligieron (el envío sigue leyendo
  // directamente de los refs, sin cambios de lógica).
  const [photosCount, setPhotosCount] = useState(0);
  const [docsCount, setDocsCount] = useState(0);

  // Formulario dinámico opcional (docs/28_dynamic_form_maintences.md)
  const [formularios, setFormularios] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [formAnswers, setFormAnswers] = useState({}); // { [fieldId]: value }
  const selectedFormulario = formularios.find((f) => String(f.id) === String(selectedFormId)) || null;

  // Modo de registro: se elige antes de mostrar el formulario.
  // null = sin elegir todavía · 'formulario' = usar un formulario predefinido
  // · 'libre' = registro con texto libre, fecha, fotos y documentos.
  const [modo, setModo] = useState(null);

  const elegirModo = (m) => {
    setModo(m);
    setSelectedFormId(m === 'formulario' && formularios.length === 1 ? String(formularios[0].id) : '');
    setFormAnswers({});
  };

  const [currentDateTime, setCurrentDateTime] = useState('');

  // Validar token y cargar equipo
  useEffect(() => {
    // Definir fecha y hora actual como límite (max)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setCurrentDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);

    if (!token) return;
    setValidando(true);
    setError(null);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments/by-qr/${token}`, {
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data || !data.id) {
          setError('Equipo no encontrado o token inválido');
        } else {
          setEquipo(data);
        }
      })
      .catch(() => setError('Error al validar el token'))
      .finally(() => setValidando(false));

    // Formularios disponibles para este equipo (opcional)
    maintenanceFormsApi
      .getAvailableByToken(token)
      .then((data) => setFormularios(Array.isArray(data) ? data : []))
      .catch(() => setFormularios([]));
  }, [token]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectFormulario = (id) => {
    setSelectedFormId(id);
    setFormAnswers({});
  };

  const handleAnswerChange = (fieldId, value) => {
    setFormAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  // Progreso del checklist (campos que no son texto libre): usado solo para
  // el badge "X/Y completados", no afecta la validación real del envío.
  const isFieldAnswered = (field) => {
    const v = formAnswers[field.id];
    return field.fieldType === 'checklist' ? v === 'true' : v !== undefined && v !== '';
  };
  const checklistFields = (selectedFormulario?.fields || []).filter((f) => f.fieldType !== 'texto_libre');
  const textFields = (selectedFormulario?.fields || []).filter((f) => f.fieldType === 'texto_libre');
  const checklistCompleted = checklistFields.filter(isFieldAnswered).length;

  // Función para comprimir imágenes
  const compressImage = (file, maxSizeMB = 1) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionar si es muy grande (máximo 1920px en el lado más largo)
          const maxDimension = 1920;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Comprimir con calidad ajustable
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Error al comprimir imagen'));
              }
            },
            'image/jpeg',
            0.8 // Calidad 80%
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if(!user.userId){
      setSaveMsg('Usuario no autenticado');
      return;
    }

    if (modo === 'formulario' && !selectedFormulario) {
      setSaveMsg('Selecciona un formulario para continuar');
      return;
    }

    // Validar campos requeridos del formulario dinámico (si hay uno seleccionado)
    if (selectedFormulario) {
      const faltante = (selectedFormulario.fields || []).find(
        (f) => f.required && !formAnswers[f.id],
      );
      if (faltante) {
        setSaveMsg(`Falta responder el campo requerido "${faltante.label}"`);
        return;
      }
    }

    // Validar tamaño de archivos (máximo 20MB por solicitud)
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB en bytes
    const photos = photosRef.current?.files;
    const docs = docsRef.current?.files;

    // Calcular tamaño total de fotos
    let photosSize = 0;
    if (photos && photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        photosSize += photos[i].size;
      }
      if (photosSize > MAX_SIZE) {
        setSaveMsg(`Las fotos exceden el límite de 20MB. Tamaño actual: ${(photosSize / (1024 * 1024)).toFixed(2)}MB`);
        return;
      }
    }

    // Calcular tamaño total de documentos
    let docsSize = 0;
    if (docs && docs.length > 0) {
      for (let i = 0; i < docs.length; i++) {
        docsSize += docs[i].size;
      }
      if (docsSize > MAX_SIZE) {
        setSaveMsg(`Los documentos exceden el límite de 20MB. Tamaño actual: ${(docsSize / (1024 * 1024)).toFixed(2)}MB`);
        return;
      }
    }

    setSaving(true);
    setSaveMsg(null);
    try {
      // 1. Crear mantención (POST JSON), con formulario dinámico opcional
      const answers = selectedFormulario
        ? (selectedFormulario.fields || [])
            .filter((f) => formAnswers[f.id] !== undefined && formAnswers[f.id] !== '')
            .map((f) => ({ fieldId: f.id, value: String(formAnswers[f.id]) }))
        : undefined;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenances/equipment/${equipo.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          userId: user?.userId,
          formTemplateId: selectedFormulario ? selectedFormulario.id : undefined,
          answers,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error del servidor: ${res.status}`);
      }
      const mant = await res.json();

      // 2. Subir fotos si hay (con compresión)
      const photos = photosRef.current?.files;
      if (photos && photos.length > 0) {
        setSaveMsg('Optimizando fotos...');
        const compressedPhotos = [];
        for (let i = 0; i < photos.length; i++) {
          try {
            const compressed = await compressImage(photos[i]);
            compressedPhotos.push(compressed);
          } catch (err) {
            console.warn('Error al comprimir foto, usando original:', err);
            compressedPhotos.push(photos[i]);
          }
        }

        setSaveMsg('Subiendo fotos...');
        const fd = new FormData();
        for (let i = 0; i < compressedPhotos.length; i++) {
          fd.append('photos', compressedPhotos[i]);
        }
        const photosRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenances/${mant.id}/photos`, {
          method: 'POST',
          credentials: 'include',
          body: fd,
        });
        if (!photosRes.ok) {
          if (photosRes.status === 413) {
            throw new Error('Las fotos exceden el límite de 20MB permitido por el servidor');
          }
          const errorData = await photosRes.json().catch(() => ({ message: 'Error al subir fotos' }));
          throw new Error(errorData.message || 'Error al subir fotos');
        }
      }
      // 3. Subir documentos si hay
      const docs = docsRef.current?.files;
      if (docs && docs.length > 0) {
        setSaveMsg('Subiendo documentos...');
        const fd = new FormData();
        for (let i = 0; i < docs.length; i++) {
          fd.append('documents', docs[i]);
        }
        const docsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenances/${mant.id}/documents`, {
          method: 'POST',
          credentials: 'include',
          body: fd,
        });
        if (!docsRes.ok) {
          if (docsRes.status === 413) {
            throw new Error('Los documentos exceden el límite de 20MB permitido por el servidor');
          }
          const errorData = await docsRes.json().catch(() => ({ message: 'Error al subir documentos' }));
          throw new Error(errorData.message || 'Error al subir documentos');
        }
      }
      setSaveMsg('Mantención registrada correctamente');
      setTimeout(() => router.push(`/qr/${token}`), 1200);
    } catch (err) {
      console.error('Error al registrar mantención:', err);
      setSaveMsg(err.message || 'Error al registrar mantención');
    }
    setSaving(false);
  };

  if (validando) return <div className="p-8 text-center text-gray-500">Validando acceso...</div>;
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)] p-4">
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-md p-6 max-w-md w-full text-center">
        <div className="text-red-500 font-bold mb-2">{error}</div>
        <button className="mt-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-semibold" onClick={() => router.push(`/qr/${token}`)}>Volver</button>
      </div>
    </div>
  );

  // Antes de mostrar cualquier campo, se elige cómo registrar la mantención.
  if (!modo) {
    return (
      <BrandCard equipo={equipo}>
        <Header token={token} equipo={equipo} onBack={() => router.push(`/qr/${token}`)} />

        <p className="text-sm font-semibold text-gray-700 mb-3">¿Cómo quieres registrar esta mantención?</p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={formularios.length === 0}
            onClick={() => elegirModo('formulario')}
            className="text-left flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border)] disabled:hover:bg-[var(--color-surface)]"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--color-primary-soft)]">
              <Icon.clipboard className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900">Usar un formulario predefinido</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formularios.length > 0
                  ? 'Completa un checklist o formulario configurado por tu institución.'
                  : 'Tu institución todavía no tiene formularios configurados.'}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => elegirModo('libre')}
            className="text-left flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--color-primary-soft)]">
              <Icon.pencil className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900">Registro libre</p>
              <p className="text-xs text-gray-500 mt-0.5">Descripción libre, fecha, técnico responsable, fotos y documentos.</p>
            </div>
          </button>
        </div>
      </BrandCard>
    );
  }

  return (
    <BrandCard equipo={equipo}>
      <Header token={token} equipo={equipo} onBack={() => router.push(`/qr/${token}`)}>
        <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => setModo(null)}
              className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)] hover:bg-[var(--color-primary-soft2)] transition"
            >
              <Icon.swap className="w-4 h-4" /> Elegir otro tipo
            </button>
            <button
              type="button"
              onClick={() => router.push(`/qr/${token}`)}
              className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)] hover:bg-[var(--color-primary-soft2)] transition"
            >
              <Icon.card className="w-4 h-4" /> Volver a la tarjeta
            </button>
          </div>
        </Header>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} encType="multipart/form-data">
          <div>
            <label className={labelCls}>Descripción <Required /></label>
            <div className="relative">
              <textarea
                name="description"
                maxLength={500}
                className={`${inputCls} min-h-[90px]`}
                value={form.description}
                onChange={handleChange}
                required
                placeholder="Describe la mantención realizada"
              />
              <span className="absolute bottom-2.5 right-3 text-xs text-gray-400">{form.description.length}/500</span>
            </div>
          </div>

          <div>
            <label className={labelCls}>Fecha y hora de realización <Required /></label>
            <div className="relative">
              <Icon.calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="datetime-local"
                name="performedAt"
                className={`${inputCls} pl-10`}
                value={form.performedAt}
                onChange={handleChange}
                max={currentDateTime}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Técnico responsable <Required /></label>
            <div className="relative">
              <Icon.user className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="technician"
                className={`${inputCls} pl-10`}
                value={form.technician}
                onChange={handleChange}
                required
                placeholder="Nombre del técnico"
              />
            </div>
          </div>

          <div className={modo === 'formulario' ? 'grid grid-cols-2 gap-3' : ''}>
            <div>
              <label className={labelCls}>Estado <Required /></label>
              <select name="status" className={inputCls} value={form.status} onChange={handleChange} required>
                <option value="">Selecciona estado</option>
                <option value="completada">Completada</option>
                <option value="pendiente">Pendiente</option>
                <option value="incompleta">Incompleta</option>
              </select>
            </div>

            {modo === 'formulario' && (
              <div>
                <label className={labelCls}>Formulario <Required /></label>
                <select
                  className={inputCls}
                  value={selectedFormId}
                  onChange={(e) => handleSelectFormulario(e.target.value)}
                  required
                >
                  <option value="">Selecciona un formulario</option>
                  {formularios.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {modo === 'formulario' && selectedFormulario && (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="font-bold text-gray-900">{selectedFormulario.name}</p>
                {checklistFields.length > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
                    {checklistCompleted}/{checklistFields.length} completados
                  </span>
                )}
              </div>

              {checklistFields
                .slice()
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((field) => (
                  field.fieldType === 'checklist' ? (
                    <label key={field.id} className="flex items-center justify-between gap-2 py-2.5 border-b border-[var(--color-border-soft)] last:border-0 cursor-pointer">
                      <span className="flex items-center gap-2.5 text-sm text-gray-800">
                        <input
                          type="checkbox"
                          checked={formAnswers[field.id] === 'true'}
                          onChange={(e) => handleAnswerChange(field.id, e.target.checked ? 'true' : 'false')}
                          className="w-4 h-4 rounded border-gray-300 accent-[var(--color-primary)]"
                        />
                        {field.label}{field.required && <span className="text-red-500"> *</span>}
                      </span>
                      <Icon.chevronDown className="w-4 h-4 text-gray-400" />
                    </label>
                  ) : (
                    <div key={field.id} className="py-2.5 border-b border-[var(--color-border-soft)] last:border-0">
                      <p className="text-sm font-semibold text-gray-800 mb-1.5">
                        {field.label}{field.required && <span className="text-red-500"> *</span>}
                      </p>
                      <select
                        className={inputCls}
                        value={formAnswers[field.id] || ''}
                        onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      >
                        <option value="">Selecciona una opción</option>
                        {(field.options || []).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  )
                ))}

              {textFields.map((field) => (
                <div key={field.id} className={checklistFields.length > 0 ? 'mt-3' : ''}>
                  <p className="text-sm font-semibold text-gray-800 mb-1.5">
                    {field.label}{field.required && <span className="text-red-500"> *</span>}
                  </p>
                  <div className="relative">
                    <textarea
                      maxLength={500}
                      className={`${inputCls} min-h-[80px] bg-[var(--color-surface)]`}
                      value={formAnswers[field.id] || ''}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      placeholder="Escribe aquí observaciones o comentarios adicionales"
                    />
                    <span className="absolute bottom-2.5 right-3 text-xs text-gray-400">{(formAnswers[field.id] || '').length}/500</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-[var(--color-border)] p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--color-primary-soft)]">
                <Icon.camera className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">Fotos <span className="font-normal text-gray-400">(opcional)</span></p>
                <p className="text-xs text-gray-500">{photosCount > 0 ? `${photosCount} foto(s) seleccionada(s)` : 'Selecciona una o más fotos'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => photosRef.current?.click()}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary)] px-3 py-2 text-sm font-semibold hover:bg-[var(--color-primary-soft)] transition"
            >
              <Icon.upload className="w-4 h-4" /> Seleccionar
            </button>
            <input
              type="file"
              name="photos"
              accept="image/*"
              multiple
              ref={photosRef}
              className="hidden"
              data-testid="photos-input"
              onChange={(e) => setPhotosCount(e.target.files?.length || 0)}
            />
          </div>
          <p className="text-xs text-gray-400 -mt-3 ml-1">Las fotos se optimizarán automáticamente para carga rápida</p>

          <div className="rounded-2xl border border-[var(--color-border)] p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--color-primary-soft)]">
                <Icon.document className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">Documentos <span className="font-normal text-gray-400">(opcional)</span></p>
                <p className="text-xs text-gray-500">{docsCount > 0 ? `${docsCount} documento(s) seleccionado(s)` : 'Selecciona uno o más documentos'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => docsRef.current?.click()}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary)] px-3 py-2 text-sm font-semibold hover:bg-[var(--color-primary-soft)] transition"
            >
              <Icon.upload className="w-4 h-4" /> Seleccionar
            </button>
            <input
              type="file"
              name="documents"
              multiple
              ref={docsRef}
              className="hidden"
              data-testid="documents-input"
              onChange={(e) => setDocsCount(e.target.files?.length || 0)}
            />
          </div>
          <p className="text-xs text-gray-400 -mt-3 ml-1">Máximo 20MB en total por grupo de documentos</p>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-white font-bold text-base shadow-sm transition disabled:opacity-60 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
          >
            <Icon.save className="w-5 h-5" /> {saving ? 'Guardando...' : 'Registrar mantención'}
          </button>

          {saveMsg && (
            <div className={`text-sm p-3 rounded-xl ${saveMsg.includes('correctamente') ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-700 bg-red-50 border border-red-200'}`}>
              {saveMsg}
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <Icon.lock className="w-3.5 h-3.5" /> Tu información está segura
          </div>
        </form>
      </BrandCard>
  );
}
