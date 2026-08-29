import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { maintenanceFormsApi } from '../../../../services/api';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center">
        <div className="text-red-500 font-bold mb-2">{error}</div>
        <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded font-semibold" onClick={() => router.push(`/qr/${token}`)}>Volver</button>
      </div>
    </div>
  );

  // Antes de mostrar cualquier campo, se elige cómo registrar la mantención.
  if (!modo) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-gray-50 py-4 px-2">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-4 md:p-8 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b pb-2">
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Nueva Mantención</h1>
              {equipo && (
                <div className="text-xs text-gray-400 mt-1">Equipo: <span className="font-mono bg-gray-100 px-1 rounded">{equipo.name}</span></div>
              )}
            </div>
            <button
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded font-semibold text-xs hover:bg-gray-300"
              onClick={() => router.push(`/qr/${token}`)}
            >
              Volver a la tarjeta
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-2">¿Cómo quieres registrar esta mantención?</p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              disabled={formularios.length === 0}
              onClick={() => elegirModo('formulario')}
              className="text-left border rounded-xl p-4 hover:border-blue-500 hover:bg-blue-50/50 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent"
            >
              <p className="font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                Usar un formulario predefinido
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formularios.length > 0
                  ? 'Completa un checklist o formulario configurado por tu institución.'
                  : 'Tu institución todavía no tiene formularios configurados.'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => elegirModo('libre')}
              className="text-left border rounded-xl p-4 hover:border-blue-500 hover:bg-blue-50/50 transition"
            >
              <p className="font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Registro libre
              </p>
              <p className="text-xs text-gray-500 mt-1">Descripción libre, fecha, técnico responsable, fotos y documentos.</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-4 px-2">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-4 md:p-8 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b pb-2">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              Nueva Mantención
            </h1>
            {equipo && (
              <div className="text-xs text-gray-400 mt-1">Equipo: <span className="font-mono bg-gray-100 px-1 rounded">{equipo.name}</span></div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded font-semibold text-xs hover:bg-gray-300"
              onClick={() => setModo(null)}
            >
              Elegir otro tipo
            </button>
            <button
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded font-semibold text-xs hover:bg-gray-300"
              onClick={() => router.push(`/qr/${token}`)}
            >
              Volver a la tarjeta
            </button>
          </div>
        </div>
        <form className="flex flex-col gap-3 mt-2" onSubmit={handleSubmit} encType="multipart/form-data">
          <label className="text-sm font-semibold">Descripción:
            <textarea
              name="description"
              className="border rounded px-2 py-1 text-sm w-full mt-1 min-h-[60px]"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="Describe la mantención realizada"
            />
          </label>
          <label className="text-sm font-semibold">Fecha y hora de realización:
            <input
              type="datetime-local"
              name="performedAt"
              className="border rounded px-2 py-1 text-sm w-full mt-1"
              value={form.performedAt}
              onChange={handleChange}
              max={currentDateTime}
              required
            />
          </label>
          <label className="text-sm font-semibold">Técnico responsable:
            <input
              type="text"
              name="technician"
              className="border rounded px-2 py-1 text-sm w-full mt-1"
              value={form.technician}
              onChange={handleChange}
              required
              placeholder="Nombre del técnico"
            />
          </label>
          <label className="text-sm font-semibold">Estado:
            <select
              name="status"
              className="border rounded px-2 py-1 text-sm w-full mt-1"
              value={form.status}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona estado</option>
              <option value="completada">Completada</option>
              <option value="pendiente">Pendiente</option>
              <option value="incompleta">Incompleta</option>
            </select>
          </label>

          {modo === 'formulario' && (
            <label className="text-sm font-semibold">Formulario:
              <select
                className="border rounded px-2 py-1 text-sm w-full mt-1"
                value={selectedFormId}
                onChange={(e) => handleSelectFormulario(e.target.value)}
                required
              >
                <option value="">Selecciona un formulario</option>
                {formularios.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </label>
          )}

          {modo === 'formulario' && selectedFormulario && (
            <div className="border rounded-lg p-3 bg-blue-50/50 flex flex-col gap-3">
              <p className="text-sm font-bold text-gray-700">{selectedFormulario.name}</p>
              {(selectedFormulario.fields || [])
                .slice()
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((field) => (
                  <label key={field.id} className="text-sm font-semibold">
                    {field.fieldType === 'checklist' ? (
                      <span className="flex items-center gap-2 font-normal">
                        <input
                          type="checkbox"
                          checked={formAnswers[field.id] === 'true'}
                          onChange={(e) => handleAnswerChange(field.id, e.target.checked ? 'true' : 'false')}
                        />
                        {field.label}{field.required && ' *'}
                      </span>
                    ) : field.fieldType === 'select' ? (
                      <>
                        {field.label}{field.required && ' *'}
                        <select
                          className="border rounded px-2 py-1 text-sm w-full mt-1"
                          value={formAnswers[field.id] || ''}
                          onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                        >
                          <option value="">Selecciona una opción</option>
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <>
                        {field.label}{field.required && ' *'}
                        <textarea
                          className="border rounded px-2 py-1 text-sm w-full mt-1 min-h-[50px]"
                          value={formAnswers[field.id] || ''}
                          onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                        />
                      </>
                    )}
                  </label>
                ))}
            </div>
          )}

          <label className="text-sm font-semibold">Fotos (opcional, puedes seleccionar varias):
            <input
              type="file"
              name="photos"
              accept="image/*"
              multiple
              ref={photosRef}
              className="block mt-1"
              data-testid="photos-input"
            />
            <span className="text-xs text-gray-500 mt-1 block">Las fotos se optimizarán automáticamente para carga rápida</span>
          </label>
          <label className="text-sm font-semibold">Documentos (opcional, puedes seleccionar varios):
            <input
              type="file"
              name="documents"
              multiple
              ref={docsRef}
              className="block mt-1"
              data-testid="documents-input"
            />
            <span className="text-xs text-gray-500 mt-1 block">Máximo 20MB en total por grupo de documentos</span>
          </label>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded font-semibold text-base hover:bg-green-700 disabled:opacity-50 mt-2"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Registrar mantención'}
          </button>
          {saveMsg && (
            <div className={`text-sm p-3 rounded ${saveMsg.includes('correctamente') ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-700 bg-red-50 border border-red-200'}`}>
              {saveMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
