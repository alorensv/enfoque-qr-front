import axios from 'axios';

export default async function handler(req, res) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/equipments';

  if (req.method === 'GET') {
    try {
      const { data } = await axios.get(API_URL);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener equipos' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
