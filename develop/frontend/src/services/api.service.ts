import type { Alumno, Sala, Profesor, ApiResponse, TomaAsistencia, DetalleAsistencia } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error en la solicitud');
  }
  return data;
};

export const apiService = {
  // Alumnos
  async getAlumnos(token: string, search?: string): Promise<ApiResponse<Alumno[]>> {
    const url = new URL(`${API_BASE_URL}/alumnos`);
    if (search) {
      url.searchParams.append('search', search);
    }
    const response = await fetch(url.toString(), {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  async getAlumnoById(token: string, id: number): Promise<ApiResponse<Alumno>> {
    const response = await fetch(`${API_BASE_URL}/alumnos/${id}`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  async createAlumno(token: string, alumno: Omit<Alumno, 'id' | 'sala'>): Promise<ApiResponse<Alumno>> {
    const response = await fetch(`${API_BASE_URL}/alumnos`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(alumno),
    });
    return handleResponse(response);
  },

  async updateAlumno(token: string, id: number, alumno: Omit<Alumno, 'id' | 'sala'>): Promise<ApiResponse<Alumno>> {
    const response = await fetch(`${API_BASE_URL}/alumnos/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(alumno),
    });
    return handleResponse(response);
  },

  async getAlumnosBySalaId(token: string, salaId: number): Promise<ApiResponse<Alumno[]>> {
    const response = await fetch(`${API_BASE_URL}/salas/${salaId}/alumnos`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  // Salas
  async getSalas(token: string): Promise<ApiResponse<Sala[]>> {
    const response = await fetch(`${API_BASE_URL}/salas`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  async getSalaById(token: string, id: number): Promise<ApiResponse<Sala>> {
    const response = await fetch(`${API_BASE_URL}/salas/${id}`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  async createSala(token: string, sala: Omit<Sala, 'id' | 'profesores'> & { profesorIds: number[] }): Promise<ApiResponse<Sala>> {
    const response = await fetch(`${API_BASE_URL}/salas`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(sala),
    });
    return handleResponse(response);
  },

  async updateSala(token: string, id: number, sala: Omit<Sala, 'id' | 'profesores'> & { profesorIds?: number[] }): Promise<ApiResponse<Sala>> {
    const response = await fetch(`${API_BASE_URL}/salas/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(sala),
    });
    return handleResponse(response);
  },

  async deleteSala(token: string, id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/salas/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  // Profesores
  async getProfesores(token: string): Promise<ApiResponse<Profesor[]>> {
    const response = await fetch(`${API_BASE_URL}/profesores`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  async getProfesorById(token: string, id: number): Promise<ApiResponse<Profesor>> {
    const response = await fetch(`${API_BASE_URL}/profesores/${id}`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  async createProfesor(token: string, profesor: Omit<Profesor, 'id' | 'creado_en' | 'actualizado_en' | 'salas'> & { password: string }): Promise<ApiResponse<Profesor>> {
    const response = await fetch(`${API_BASE_URL}/profesores`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(profesor),
    });
    return handleResponse(response);
  },

  async updateProfesor(token: string, id: number, profesor: Omit<Profesor, 'id' | 'creado_en' | 'actualizado_en' | 'salas'> & { password?: string }): Promise<ApiResponse<Profesor>> {
    const response = await fetch(`${API_BASE_URL}/profesores/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(profesor),
    });
    return handleResponse(response);
  },

  async deleteProfesor(token: string, id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/profesores/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  async changePassword(token: string, profesorId: number, password: string): Promise<ApiResponse<Profesor>> {
    const response = await fetch(`${API_BASE_URL}/profesores/${profesorId}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ password }),
    });
    return handleResponse(response);
  },

  // Asistencias
  async getHistorial(token: string): Promise<ApiResponse<TomaAsistencia[]>> {
    const response = await fetch(`${API_BASE_URL}/asistencias`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  async getTomaAsistenciaById(token: string, id: number): Promise<ApiResponse<TomaAsistencia>> {
    const response = await fetch(`${API_BASE_URL}/asistencias/${id}`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  async getTomaAsistenciasBySalaId(token: string, salaId: number): Promise<ApiResponse<TomaAsistencia[]>> {
    const response = await fetch(`${API_BASE_URL}/salas/${salaId}/asistencias`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  async createOrUpdateTomaAsistencia(token: string, data: {
    salaId: number;
    fecha: string;
    detalles: { alumnoId: number; presente: boolean; observacion?: string }[];
  }): Promise<ApiResponse<TomaAsistencia>> {
    const response = await fetch(`${API_BASE_URL}/asistencias`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteTomaAsistencia(token: string, id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/asistencias/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },
};
