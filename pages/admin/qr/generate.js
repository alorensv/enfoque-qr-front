import { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';

export default function GenerateQRBatch() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(10);
  const [prefix, setPrefix] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/qr/generate-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          quantity: parseInt(quantity),
          prefix: prefix || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar códigos QR');
      }

      const data = await response.json();
      setGeneratedCodes(data.qr_codes);
      alert(`${data.generated} códigos QR generados exitosamente`);
    } catch (err) {
      setError(err.message);
      alert('Error al generar códigos QR: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (generatedCodes.length === 0) {
      alert('No hay códigos QR generados');
      return;
    }

    const csv = [
      'id,token,url,created_at',
      ...generatedCodes.map(qr => `${qr.id},${qr.token},${qr.url},${qr.created_at}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr_codes_${Date.now()}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Generar Códigos QR en Lote</h1>
          <p className="mt-2 text-gray-600">
            Genera múltiples códigos QR para asignar posteriormente a equipos
          </p>
        </div>

        {/* Formulario de generación */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <form onSubmit={handleGenerate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad de QR
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Entre 1 y 1000 códigos
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prefijo (opcional)
                </label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="Ej: FAB-2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  maxLength="50"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Para identificar el lote
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Generando...' : 'Generar Lote'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/admin/equipos')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* Lista de códigos generados */}
        {generatedCodes.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Códigos QR Generados ({generatedCodes.length})
              </h2>
              <button
                onClick={handleDownloadCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Descargar CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generatedCodes.map((qr) => (
                    <tr key={qr.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {qr.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {qr.token}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <a href={qr.url} target="_blank" rel="noopener noreferrer">
                          {qr.url}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {qr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
