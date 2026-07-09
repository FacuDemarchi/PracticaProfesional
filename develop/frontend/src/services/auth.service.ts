import type { LoginCredentials, LoginResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Clave incorrecta' }));
        throw new Error(errorData.message || 'Clave incorrecta');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.message === 'Failed to fetch') {
        throw new Error('No se pudo conectar con el servidor');
      }

      throw error;
    }
  },
};
