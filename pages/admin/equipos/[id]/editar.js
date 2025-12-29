import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';

export default function EditarEquipo() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({ name: '', serialNumber: '', description: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/equipos/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm({
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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/equipos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Error al actualizar equipo');
      router.push('/admin/equipos');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><div className="text-center py-10 text-gray-500">Cargando equipo...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Editar equipo</h1>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Nombre</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">N° de serie</label>
            <input name="serialNumber" value={form.serialNumber} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Estado</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2">
              <option value="">Selecciona estado</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold" onClick={() => router.push('/admin/equipos')}>Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
