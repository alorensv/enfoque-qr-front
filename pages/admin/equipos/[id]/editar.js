import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';
import EquipmentForm from '../../../../components/EquipmentForm';

export default function EditarEquipo() {
  const router = useRouter();
  const { id } = router.query;
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments/${id}`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setInitialData({
          name: data.name || '',
          serialNumber: data.serialNumber || '',
          description: data.description || '',
          status: data.status || '',
        });
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar el equipo');
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async ({ formData }) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Error al actualizar equipo');
      router.push('/admin/equipos');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-10 text-gray-500">Cargando equipo...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900 flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar equipo
        </h1>
        {initialData && (
          <EquipmentForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/admin/equipos')}
            submitLabel="Guardar cambios"
            loading={saving}
            showPhotoUpload={false}
            error={error}
          />
        )}
      </div>
    </AdminLayout>
  );
}
