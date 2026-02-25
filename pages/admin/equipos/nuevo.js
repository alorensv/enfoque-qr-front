import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout';
import EquipmentForm from '../../../components/EquipmentForm';

export default function NuevoEquipo() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async ({ formData, equipmentPhoto }) => {
    setError(null);
    if (!formData.name || !formData.status) {
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
      const data = new FormData();
      data.append('name', formData.name);
      data.append('serialNumber', formData.serialNumber);
      data.append('status', formData.status);
      data.append('description', formData.description || '');
      data.append('institutionId', institutionId);
      if (equipmentPhoto) {
        data.append('equipmentPhoto', equipmentPhoto);
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments`, {
        method: 'POST',
        credentials: 'include',
        body: data
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
          <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo equipo
        </h1>
        <EquipmentForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/equipos')}
          submitLabel="Guardar equipo"
          loading={submitting}
          showPhotoUpload={true}
          error={error}
        />
      </div>
    </AdminLayout>
  );
}
