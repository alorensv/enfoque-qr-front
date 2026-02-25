const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const qrApi = {
  /**
   * Generar lote de códigos QR
   */
  generateBatch: async (quantity, prefix) => {
    const response = await fetch(`${API_URL}/qr/generate-batch`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ quantity, prefix }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al generar lote');
    }

    return response.json();
  },

  /**
   * Listar códigos QR disponibles
   */
  getAvailable: async (page = 1, limit = 50, search = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await fetch(`${API_URL}/qr/available/list?${params}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener códigos QR disponibles');
    }

    return response.json();
  },

  /**
   * Validar token QR
   */
  validateToken: async (token) => {
    const response = await fetch(`${API_URL}/qr/validate/${token}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al validar token');
    }

    return response.json();
  },

  /**
   * Revocar código QR
   */
  revokeQR: async (id) => {
    const response = await fetch(`${API_URL}/qr/${id}/revoke`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al revocar código QR');
    }

    return response.json();
  },
};

export const equipmentApi = {
  /**
   * Enrolar equipo con QR pre-generado
   */
  enrollWithQR: async (qrToken, equipmentData) => {
    const response = await fetch(`${API_URL}/equipments/enroll`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        qr_token: qrToken,
        equipment_data: equipmentData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al enrolar equipo');
    }

    return response.json();
  },

  /**
   * Obtener todos los equipos
   */
  getAll: async () => {
    const response = await fetch(`${API_URL}/equipments`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener equipos');
    }

    return response.json();
  },

  /**
   * Obtener equipo por ID
   */
  getById: async (id) => {
    const response = await fetch(`${API_URL}/equipments/${id}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener equipo');
    }

    return response.json();
  },

  /**
   * Crear equipo (método tradicional)
   */
  create: async (equipmentData) => {
    const response = await fetch(`${API_URL}/equipments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(equipmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear equipo');
    }

    return response.json();
  },

  /**
   * Actualizar equipo
   */
  update: async (id, equipmentData) => {
    const response = await fetch(`${API_URL}/equipments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(equipmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar equipo');
    }

    return response.json();
  },

  /**
   * Eliminar equipo (soft delete)
   */
  delete: async (id) => {
    const response = await fetch(`${API_URL}/equipments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar equipo');
    }

    return response.json();
  },
};

export const institutionApi = {
  /**
   * Obtener todas las instituciones
   */
  getAll: async () => {
    const response = await fetch(`${API_URL}/institutions`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener instituciones');
    }

    return response.json();
  },
};
