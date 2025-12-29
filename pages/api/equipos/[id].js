
export default async function handler(req, res) {
  const { id } = req.query;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/equipments';

  if (req.method === 'GET') {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      res.status(200).json(data);
    } catch {
      res.status(404).json({ message: 'Equipo no encontrado' });
    }
  } else if (req.method === 'PUT') {
    try {
      const response = await fetch(`${API_URL}/${id}` , {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      res.status(200).json(data);
    } catch {
      res.status(400).json({ message: 'Error al actualizar equipo' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      res.status(204).end();
    } catch {
      res.status(400).json({ message: 'Error al eliminar equipo' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
