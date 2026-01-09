import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout';

export default function NuevoEquipo() {
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [status, setStatus] = useState('');
  const [equipmentPhoto, setEquipmentPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name || !status) {
      setError('Por favor completa los campos obligatorios.');
      return;
    }
    const institutionId = user?.institutionId;
    if (!institutionId) {
      setError('No se pudo obtener la institución del usuario');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('serialNumber', serialNumber);
      formData.append('status', status);
      formData.append('institutionId', institutionId);
      if (equipmentPhoto) {
        formData.append('equipmentPhoto', equipmentPhoto);
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/equipments`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error al crear el equipo');
      }
      router.push('/admin/equipos');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-lg mx-auto py-10 px-4">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900 flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Nuevo equipo
        </h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-6" autoComplete="off" aria-label="Formulario para crear equipo">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
            <input
              id="name"
              type="text"
              className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition ${error && !name ? 'border-red-400' : 'border-gray-200'}`}
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={submitting}
              placeholder="Ej: Computadora principal"
              aria-required="true"
              aria-invalid={!!error && !name}
            />
          </div>
          <div>
            <label htmlFor="serialNumber" className="block text-sm font-semibold text-gray-700 mb-1">Número de serie</label>
            <input
              id="serialNumber"
              type="text"
              className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none border-gray-200 transition"
              value={serialNumber}
              onChange={e => setSerialNumber(e.target.value)}
              disabled={submitting}
              placeholder="Opcional"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-1">Estado <span className="text-red-500">*</span></label>
            <select
              id="status"
              className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition ${error && !status ? 'border-red-400' : 'border-gray-200'}`}
              value={status}
              onChange={e => setStatus(e.target.value)}
              required
              disabled={submitting}
              aria-required="true"
              aria-invalid={!!error && !status}
            >
              <option value="">Selecciona un estado</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>
          <div>
            <label htmlFor="equipmentPhoto" className="block text-sm font-semibold text-gray-700 mb-1">Foto del equipo</label>
            <input
              id="equipmentPhoto"
              type="file"
              accept="image/*"
              className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none border-gray-200 transition"
              onChange={e => setEquipmentPhoto(e.target.files[0])}
              disabled={submitting}
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Link href="/admin/equipos" className="inline-flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-gray-200">
              Cancelar
            </Link>
            <button
              type="submit"
              className={`inline-flex items-center px-6 py-2 rounded-lg text-white font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 ${submitting ? 'opacity-50 pointer-events-none' : ''}`}
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? (
                <>
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Guardar equipo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
