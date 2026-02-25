import { useState } from 'react';

/**
 * Componente reutilizable para formularios de equipos
 * Usado en: crear equipo, editar equipo, enrolar con QR
 */
export default function EquipmentForm({ 
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'Guardar equipo',
  loading = false,
  showPhotoUpload = false,
  showInstitution = false,
  institutions = [],
  error = null
}) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    serialNumber: initialData.serialNumber || '',
    description: initialData.description || '',
    status: initialData.status || '',
    institutionId: initialData.institutionId || '',
    ...initialData
  });
  const [equipmentPhoto, setEquipmentPhoto] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setEquipmentPhoto(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filtrar datos según la configuración del formulario
    const dataToSend = {
      name: formData.name,
      serialNumber: formData.serialNumber,
      description: formData.description,
      status: formData.status,
    };
    
    // Solo incluir institutionId si showInstitution está habilitado
    if (showInstitution && formData.institutionId) {
      dataToSend.institutionId = formData.institutionId;
    }
    
    onSubmit({ formData: dataToSend, equipmentPhoto });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-6" autoComplete="off">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Ej: Computadora principal"
            className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition ${error && !formData.name ? 'border-red-400' : 'border-gray-200'}`}
          />
        </div>

        {/* Número de Serie */}
        <div>
          <label htmlFor="serialNumber" className="block text-sm font-semibold text-gray-700 mb-1">
            Número de serie
          </label>
          <input
            id="serialNumber"
            name="serialNumber"
            type="text"
            value={formData.serialNumber}
            onChange={handleChange}
            disabled={loading}
            placeholder="Opcional"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
          />
        </div>

        {/* Institución (solo si showInstitution está habilitado) */}
        {showInstitution && (
          <div>
            <label htmlFor="institutionId" className="block text-sm font-semibold text-gray-700 mb-1">
              Institución <span className="text-red-500">*</span>
            </label>
            <select
              id="institutionId"
              name="institutionId"
              value={formData.institutionId}
              onChange={handleChange}
              required={showInstitution}
              disabled={loading}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition ${error && !formData.institutionId ? 'border-red-400' : 'border-gray-200'}`}
            >
              <option value="">Seleccione una institución</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Estado */}
        <div className={showInstitution ? '' : 'md:col-span-2'}>
          <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-1">
            Estado <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            disabled={loading}
            className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition ${error && !formData.status ? 'border-red-400' : 'border-gray-200'}`}
          >
            <option value="">Selecciona un estado</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
            rows={4}
            placeholder="Descripción detallada del equipo..."
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
          />
        </div>

        {/* Foto del equipo (solo si showPhotoUpload está habilitado) */}
        {showPhotoUpload && (
          <div className="md:col-span-2">
            <label htmlFor="equipmentPhoto" className="block text-sm font-semibold text-gray-700 mb-1">
              Foto del equipo
            </label>
            <input
              id="equipmentPhoto"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
            />
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="text-red-500 text-sm text-center flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {error}
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex items-center px-6 py-2 rounded-lg text-white font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
