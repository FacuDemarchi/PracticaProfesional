import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { authService } from '../services/auth.service';
import type { LoginCredentials } from '../types';

export const Login = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useSession();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(credentials);
      login(response.token, response.user);
      
      if (response.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profesor');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Clave incorrecta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          Sistema de Asistencia
        </h1>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              color: '#dc2626',
              backgroundColor: '#fee2e2',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
              Clave de Acceso
            </label>
            <input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
            }}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};
