import AdminLayout from '../../../components/AdminLayout';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

export default function NuevoDocumento() {
  const router = useRouter();
  const { equipmentId } = router.query;
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    type: '',
    file: null,
    userId: 1, // Simulado, deberías obtener el usuario real
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setForm(f => ({ ...f, file: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    if (!form.file) {
      setMsg('Debes seleccionar un archivo');
      setSaving(false);
      return;
    }
    // Obtener institutionId del usuario autenticado
    const institutionId = user?.institutionId;
    if (!institutionId) {
      setMsg('No se pudo obtener la institución del usuario');
      setSaving(false);
      return;
    }
    const data = new FormData();
    data.append('file', form.file);
    data.append('name', form.name);
    data.append('type', form.type);
    data.append('userId', String(form.userId));
    data.append('institutionId', String(institutionId));

    console.log(JSON.stringify(data));
    // Mostrar en consola todos los campos y valores del FormData
    for (let pair of data.entries()) {
      console.log(pair[0], pair[1]);
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/equipments/${equipmentId}/documents`, {
      method: 'POST',
      body: data
    });
    if (res.ok) {
      setMsg('Documento cargado correctamente');
      setTimeout(() => router.push('/admin/equipos'), 1200);
    } else {
      setMsg('Error al cargar documento');
    }
    setSaving(false);
  };

  return (
    <AdminLayout>
      <div className="max-w-lg mx-auto py-10 px-4">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900 flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Nuevo documento
        </h1>
        <form className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-6" onSubmit={handleSubmit} autoComplete="off" aria-label="Formulario para cargar documento">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del documento <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none transition border-gray-200"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Ej: Manual, Certificado, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo</label>
            <input
              type="text"
              name="type"
              className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none border-gray-200 transition"
              value={form.type}
              onChange={handleChange}
              placeholder="Manual, Certificado, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Archivo <span className="text-red-500">*</span></label>
            <input
              type="file"
              name="file"
              className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none border-gray-200 transition"
              onChange={handleChange}
              required
            />
          </div>
          {msg && (
            <div className={`text-sm text-center flex items-center justify-center gap-2 ${msg.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              {msg}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
              onClick={() => router.back()}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`inline-flex items-center px-6 py-2 rounded-lg text-white font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 ${saving ? 'opacity-50 pointer-events-none' : ''}`}
              disabled={saving}
              aria-busy={saving}
            >
              {saving ? (
                <>
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg>
                  Cargando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Cargar documento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
