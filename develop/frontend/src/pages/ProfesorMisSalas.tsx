import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { apiService } from '../services/api.service';
import type { Sala } from '../types';

export const ProfesorMisSalas = () => {
  const { token } = useSession();
  const navigate = useNavigate();
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalas = async () => {
      if (!token) return;
      try {
        const response = await apiService.getSalas(token);
        setSalas(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar las salas');
      } finally {
        setLoading(false);
      }
    };

    fetchSalas();
  }, [token]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Mis Salas</h2>
      {salas.length === 0 ? (
        <p>No tienes salas asignadas</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          {salas.map((sala) => (
            <div
              key={sala.id}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{sala.nombre}</h3>
              <p style={{ margin: '0.25rem 0', color: '#666' }}>
                Horario: {sala.hora_inicio} - {sala.hora_fin}
              </p>
              <p style={{ margin: '0.25rem 0', color: '#666' }}>
                Profesores: {sala.profesores?.map((p) => `${p.nombre} ${p.apellido}`).join(', ') || 'N/A'}
              </p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => navigate(`/profesor/salas/${sala.id}/asistencia`)}
                  style={{
                    backgroundColor: '#2d5016',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                  }}
                >
                  Tomar Asistencia
                </button>
                <Link
                  to={`/profesor/historial?salaId=${sala.id}`}
                  style={{
                    backgroundColor: '#4a5568',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                  }}
                >
                  Ver Historial
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
