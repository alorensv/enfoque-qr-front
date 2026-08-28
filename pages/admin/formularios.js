import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import InlineLoader from '../../components/InlineLoader';
import { maintenanceFormsApi } from '../../services/api';

const FIELD_TYPES = [
  { value: 'texto_libre', label: 'Texto libre' },
  { value: 'checklist', label: 'Checklist (sí/no)' },
  { value: 'select', label: 'Select (opciones)' },
];

function emptyField() {
  return { label: '', fieldType: 'texto_libre', required: false, optionsText: '' };
}

function emptyBuilder() {
  return { id: null, name: '', description: '', enabled: true, fields: [emptyField()] };
}

export default function FormulariosPage() {
  const [formularios, setFormularios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [builder, setBuilder] = useState(null); // null = cerrado
  const [loadingBuilder, setLoadingBuilder] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchFormularios();
  }, []);

  const fetchFormularios = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceFormsApi.getAll();
      setFormularios(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los formularios');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setSaveError(null);
    setBuilder(emptyBuilder());
  };

  const openEdit = async (template) => {
    setSaveError(null);
    setLoadingBuilder(true);
    setBuilder({ id: template.id, name: template.name, description: '', enabled: !!template.enabled, fields: [] });
    try {
      const detail = await maintenanceFormsApi.getById(template.id);
      setBuilder({
        id: detail.id,
        name: detail.name,
        description: detail.description || '',
        enabled: !!detail.enabled,
        fields: (detail.fields || [])
          .slice()
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((f) => ({
            label: f.label,
            fieldType: f.fieldType,
            required: !!f.required,
            optionsText: (f.options || []).join('\n'),
          })),
      });
    } catch (err) {
      setSaveError(err.message || 'Error al cargar el formulario');
    } finally {
      setLoadingBuilder(false);
    }
  };

  const closeBuilder = () => {
    if (saving) return;
    setBuilder(null);
    setSaveError(null);
  };

  const updateField = (index, patch) => {
    setBuilder((b) => ({
      ...b,
      fields: b.fields.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    }));
  };

  const addField = () => {
    setBuilder((b) => ({ ...b, fields: [...b.fields, emptyField()] }));
  };

  const removeField = (index) => {
    setBuilder((b) => ({ ...b, fields: b.fields.filter((_, i) => i !== index) }));
  };

  const moveField = (index, dir) => {
    setBuilder((b) => {
      const fields = b.fields.slice();
      const target = index + dir;
      if (target < 0 || target >= fields.length) return b;
      [fields[index], fields[target]] = [fields[target], fields[index]];
      return { ...b, fields };
    });
  };

  const handleSave = async () => {
    setSaveError(null);
    if (!builder.name.trim()) {
      setSaveError('El formulario necesita un nombre');
      return;
    }
    if (builder.fields.length === 0) {
      setSaveError('Agrega al menos un campo');
      return;
    }
    for (const f of builder.fields) {
      if (!f.label.trim()) {
        setSaveError('Todos los campos necesitan un label');
        return;
      }
      if (f.fieldType === 'select' && !f.optionsText.trim()) {
        setSaveError(`El campo "${f.label}" es select y necesita al menos una opción`);
        return;
      }
    }

    const payload = {
      name: builder.name.trim(),
      description: builder.description?.trim() || undefined,
      fields: builder.fields.map((f, index) => ({
        label: f.label.trim(),
        fieldType: f.fieldType,
        required: !!f.required,
        orderIndex: index,
        options:
          f.fieldType === 'select'
            ? f.optionsText.split('\n').map((o) => o.trim()).filter(Boolean)
            : undefined,
      })),
    };

    setSaving(true);
    try {
      if (builder.id) {
        await maintenanceFormsApi.update(builder.id, payload);
      } else {
        await maintenanceFormsApi.create(payload);
      }
      setBuilder(null);
      await fetchFormularios();
    } catch (err) {
      setSaveError(err.message || 'Error al guardar el formulario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este formulario?')) return;
    setDeletingId(id);
    try {
      await maintenanceFormsApi.remove(id);
      setFormularios((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      alert(err.message || 'Error al eliminar el formulario');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="w-full py-4 px-2 md:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Formularios</h1>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-4 py-2 text-sm shadow-sm transition flex items-center gap-2"
            onClick={openCreate}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Nuevo formulario
          </button>
        </div>
        <p className="text-sm text-gray-500 -mt-4 mb-6">
          Formularios personalizados (checklist, texto libre, select) que los técnicos pueden completar al registrar una mantención desde el QR.
        </p>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          {loading ? (
            <InlineLoader label="Cargando formularios" />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24">
              <span className="text-red-500 text-xl">{error}</span>
            </div>
          ) : formularios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <svg className="w-20 h-20 text-blue-200 mb-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="text-gray-500 text-xl mb-2 font-medium">Aún no hay formularios creados.</p>
              <p className="text-gray-400 mb-6">Crea uno para que los técnicos lo completen al registrar mantenciones.</p>
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              <table className="w-full table-fixed divide-y divide-gray-200">
                <colgroup>
                  <col style={{ width: '40%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Campos</th>
                    <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-3 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {formularios.map((f) => (
                    <tr key={f.id} className="hover:bg-blue-50/40 transition group">
                      <td className="px-3 py-4 max-w-0">
                        <p className="font-semibold text-gray-900 truncate">{f.name}</p>
                        {f.description && <p className="text-xs text-gray-500 truncate">{f.description}</p>}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-600">{f.fields?.length ?? '—'}</td>
                      <td className="px-3 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${f.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {f.enabled ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <div className="flex gap-3 justify-center">
                          <button className="text-blue-600 hover:underline text-sm font-medium" onClick={() => openEdit(f)}>
                            Editar
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                            onClick={() => handleDelete(f.id)}
                            disabled={deletingId === f.id}
                          >
                            {deletingId === f.id ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Builder: crear/editar formulario */}
      {builder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeBuilder}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {builder.id ? 'Editar formulario' : 'Nuevo formulario'}
            </h2>

            {loadingBuilder ? (
              <InlineLoader label="Cargando formulario" />
            ) : (
              <>
                <div className="flex flex-col gap-3 mb-5">
                  <label className="text-sm font-semibold text-gray-700">Nombre
                    <input
                      type="text"
                      className="border rounded px-2 py-1.5 text-sm w-full mt-1"
                      value={builder.name}
                      onChange={(e) => setBuilder({ ...builder, name: e.target.value })}
                      placeholder="Ej: Checklist mantención eléctrica"
                    />
                  </label>
                  <label className="text-sm font-semibold text-gray-700">Descripción (opcional)
                    <textarea
                      className="border rounded px-2 py-1.5 text-sm w-full mt-1 min-h-[50px]"
                      value={builder.description}
                      onChange={(e) => setBuilder({ ...builder, description: e.target.value })}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-700">Campos</h3>
                  <button
                    type="button"
                    className="text-blue-600 hover:underline text-sm font-medium"
                    onClick={addField}
                  >
                    + Agregar campo
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {builder.fields.map((field, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 flex flex-col gap-2">
                          <input
                            type="text"
                            className="border rounded px-2 py-1.5 text-sm w-full"
                            placeholder="Label del campo (ej: Nivel de aceite OK)"
                            value={field.label}
                            onChange={(e) => updateField(index, { label: e.target.value })}
                          />
                          <div className="flex gap-3 items-center flex-wrap">
                            <select
                              className="border rounded px-2 py-1.5 text-sm"
                              value={field.fieldType}
                              onChange={(e) => updateField(index, { fieldType: e.target.value })}
                            >
                              {FIELD_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                            <label className="text-xs text-gray-600 flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(index, { required: e.target.checked })}
                              />
                              Requerido
                            </label>
                          </div>
                          {field.fieldType === 'select' && (
                            <textarea
                              className="border rounded px-2 py-1.5 text-sm w-full min-h-[60px]"
                              placeholder={'Una opción por línea\nEj:\nBueno\nRegular\nMalo'}
                              value={field.optionsText}
                              onChange={(e) => updateField(index, { optionsText: e.target.value })}
                            />
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <button type="button" title="Subir" className="text-gray-400 hover:text-gray-700 disabled:opacity-30" disabled={index === 0} onClick={() => moveField(index, -1)}>▲</button>
                          <button type="button" title="Bajar" className="text-gray-400 hover:text-gray-700 disabled:opacity-30" disabled={index === builder.fields.length - 1} onClick={() => moveField(index, 1)}>▼</button>
                          <button type="button" title="Quitar campo" className="text-red-500 hover:text-red-700 font-bold" onClick={() => removeField(index)}>&times;</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {saveError && (
                  <div className="text-sm p-3 rounded mt-4 text-red-700 bg-red-50 border border-red-200">{saveError}</div>
                )}

                <div className="flex gap-2 justify-end mt-5">
                  <button className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100" onClick={closeBuilder} disabled={saving}>
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
