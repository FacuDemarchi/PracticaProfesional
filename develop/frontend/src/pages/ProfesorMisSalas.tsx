import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { apiService } from '../services/api.service';
import type { Alumno, Sala } from '../types';

export const ProfesorMisSalas = () => {
  const { token } = useSession();
  const navigate = useNavigate();
  const [salas, setSalas] = useState<Sala[]>([]);
  const [expandedSalaId, setExpandedSalaId] = useState<number | null>(null);
  const [alumnosPorSala, setAlumnosPorSala] = useState<Record<number, Alumno[]>>({});
  const [loadingAlumnos, setLoadingAlumnos] = useState<Record<number, boolean>>({});
  const [errorAlumnos, setErrorAlumnos] = useState<Record<number, string>>({});
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

  const toggleSala = async (salaId: number) => {
    if (expandedSalaId === salaId) {
      setExpandedSalaId(null);
      return;
    }

    setExpandedSalaId(salaId);

    if (!token || alumnosPorSala[salaId]) {
      return;
    }

    try {
      setLoadingAlumnos((prev) => ({ ...prev, [salaId]: true }));
      setErrorAlumnos((prev) => ({ ...prev, [salaId]: '' }));
      const response = await apiService.getAlumnosBySalaId(token, salaId);
      setAlumnosPorSala((prev) => ({ ...prev, [salaId]: response.data || [] }));
    } catch (err) {
      setErrorAlumnos((prev) => ({
        ...prev,
        [salaId]: err instanceof Error ? err.message : 'Error al cargar alumnos',
      }));
    } finally {
      setLoadingAlumnos((prev) => ({ ...prev, [salaId]: false }));
    }
  };

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
          {salas.map((sala) => {
            const isExpanded = expandedSalaId === sala.id;
            const alumnos = alumnosPorSala[sala.id] || [];
            const alumnosLoading = !!loadingAlumnos[sala.id];
            const alumnosError = errorAlumnos[sala.id];

            return (
              <div
                key={sala.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                }}
              >
                <div
                  onClick={() => void toggleSala(sala.id)}
                  style={{
                    padding: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1rem', color: '#2d5016' }}>{isExpanded ? '▼' : '▶'}</span>
                      <h3 style={{ margin: 0 }}>{sala.nombre}</h3>
                    </div>
                    <p style={{ margin: '0.5rem 0 0.25rem 0', color: '#666' }}>
                      Horario: {sala.hora_inicio} - {sala.hora_fin}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>
                      Profesores: {sala.profesores?.map((p) => `${p.nombre} ${p.apellido}`).join(', ') || 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profesor/salas/${sala.id}/asistencia`);
                    }}
                    style={{
                      backgroundColor: '#2d5016',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Tomar Asistencia
                  </button>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      padding: '1rem 1.5rem 1.5rem 1.5rem',
                      backgroundColor: '#f7fafc',
                    }}
                  >
                    <h4 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>Alumnos</h4>

                    {alumnosLoading ? (
                      <p style={{ margin: 0, color: '#666' }}>Cargando alumnos...</p>
                    ) : alumnosError ? (
                      <p style={{ margin: 0, color: '#c53030' }}>{alumnosError}</p>
                    ) : alumnos.length === 0 ? (
                      <p style={{ margin: 0, color: '#666' }}>No hay alumnos asignados a esta sala</p>
                    ) : (
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {alumnos.map((alumno) => (
                          <div
                            key={alumno.id}
                            style={{
                              padding: '0.75rem 1rem',
                              borderRadius: '0.375rem',
                              backgroundColor: 'white',
                              border: '1px solid #e2e8f0',
                              color: '#2d3748',
                            }}
                          >
                            {alumno.nombre} {alumno.apellido}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
