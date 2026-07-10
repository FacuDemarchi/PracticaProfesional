import { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { apiService } from '../services/api.service';
import type { Alumno, Sala, TomaAsistencia } from '../types';

type SalaFeedback = {
  type: 'success' | 'error';
  message: string;
};

export const ProfesorMisSalas = () => {
  const { token } = useSession();
  const [salas, setSalas] = useState<Sala[]>([]);
  const [expandedSalaId, setExpandedSalaId] = useState<number | null>(null);
  const [alumnosPorSala, setAlumnosPorSala] = useState<Record<number, Alumno[]>>({});
  const [loadingAlumnos, setLoadingAlumnos] = useState<Record<number, boolean>>({});
  const [errorAlumnos, setErrorAlumnos] = useState<Record<number, string>>({});
  const [asistenciaPorSala, setAsistenciaPorSala] = useState<Record<number, Record<number, boolean>>>({});
  const [savingAsistencia, setSavingAsistencia] = useState<Record<number, boolean>>({});
  const [processingAlumnoId, setProcessingAlumnoId] = useState<number | null>(null);
  const [feedbackPorSala, setFeedbackPorSala] = useState<Record<number, SalaFeedback | undefined>>({});
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

  const getToday = () => new Date().toISOString().split('T')[0];

  const buildAsistenciaInicial = (alumnos: Alumno[], tomaHoy?: TomaAsistencia) => {
    const asistenciaInicial: Record<number, boolean> = {};

    alumnos.forEach((alumno) => {
      asistenciaInicial[alumno.id] = false;
    });

    if (tomaHoy?.detalles) {
      tomaHoy.detalles.forEach((detalle) => {
        asistenciaInicial[detalle.alumno_id] = detalle.presente;
      });
    }

    return asistenciaInicial;
  };

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
      const [alumnosResponse, historialResponse] = await Promise.all([
        apiService.getAlumnosBySalaId(token, salaId),
        apiService.getTomaAsistenciasBySalaId(token, salaId),
      ]);
      const alumnos = alumnosResponse.data || [];
      const tomaHoy = (historialResponse.data || []).find((toma) => toma.fecha === getToday());
      setAlumnosPorSala((prev) => ({ ...prev, [salaId]: alumnos }));
      setAsistenciaPorSala((prev) => ({
        ...prev,
        [salaId]: buildAsistenciaInicial(alumnos, tomaHoy),
      }));
    } catch (err) {
      setErrorAlumnos((prev) => ({
        ...prev,
        [salaId]: err instanceof Error ? err.message : 'Error al cargar alumnos',
      }));
    } finally {
      setLoadingAlumnos((prev) => ({ ...prev, [salaId]: false }));
    }
  };

  const handleToggleAsistencia = (salaId: number, alumnoId: number, checked: boolean) => {
    setAsistenciaPorSala((prev) => ({
      ...prev,
      [salaId]: {
        ...(prev[salaId] || {}),
        [alumnoId]: checked,
      },
    }));
  };

  const handleGuardarAsistencia = async (salaId: number) => {
    if (!token) return;

    const alumnos = alumnosPorSala[salaId] || [];
    if (alumnos.length === 0) {
      return;
    }

    try {
      setSavingAsistencia((prev) => ({ ...prev, [salaId]: true }));
      setFeedbackPorSala((prev) => ({ ...prev, [salaId]: undefined }));

      const detalles = alumnos.map((alumno) => ({
        alumnoId: alumno.id,
        presente: asistenciaPorSala[salaId]?.[alumno.id] ?? false,
      }));

      await apiService.createOrUpdateTomaAsistencia(token, {
        salaId,
        fecha: getToday(),
        detalles,
      });

      setFeedbackPorSala((prev) => ({
        ...prev,
        [salaId]: { type: 'success', message: 'Asistencia guardada correctamente' },
      }));
    } catch (err) {
      setFeedbackPorSala((prev) => ({
        ...prev,
        [salaId]: {
          type: 'error',
          message: err instanceof Error ? err.message : 'Error al guardar la asistencia',
        },
      }));
    } finally {
      setSavingAsistencia((prev) => ({ ...prev, [salaId]: false }));
    }
  };

  const removeAlumnoFromSalaState = (salaId: number, alumnoId: number) => {
    setAlumnosPorSala((prev) => ({
      ...prev,
      [salaId]: (prev[salaId] || []).filter((alumno) => alumno.id !== alumnoId),
    }));
    setAsistenciaPorSala((prev) => {
      const asistenciaSala = { ...(prev[salaId] || {}) };
      delete asistenciaSala[alumnoId];
      return { ...prev, [salaId]: asistenciaSala };
    });
  };

  const handleInactivarAlumno = async (salaId: number, alumno: Alumno) => {
    if (!token) return;

    try {
      setProcessingAlumnoId(alumno.id);
      await apiService.updateAlumno(token, alumno.id, {
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        sala_id: alumno.sala_id,
        activo: false,
      });
      removeAlumnoFromSalaState(salaId, alumno.id);
      setFeedbackPorSala((prev) => ({
        ...prev,
        [salaId]: { type: 'success', message: 'Alumno puesto en estado inactivo' },
      }));
    } catch (err) {
      setFeedbackPorSala((prev) => ({
        ...prev,
        [salaId]: {
          type: 'error',
          message: err instanceof Error ? err.message : 'Error al inactivar el alumno',
        },
      }));
    } finally {
      setProcessingAlumnoId(null);
    }
  };

  const handleEliminarAlumno = async (salaId: number, alumno: Alumno) => {
    if (!token) return;

    const confirmed = window.confirm(`Eliminar a ${alumno.nombre} ${alumno.apellido}?`);
    if (!confirmed) {
      return;
    }

    try {
      setProcessingAlumnoId(alumno.id);
      await apiService.deleteAlumno(token, alumno.id);
      removeAlumnoFromSalaState(salaId, alumno.id);
      setFeedbackPorSala((prev) => ({
        ...prev,
        [salaId]: { type: 'success', message: 'Alumno eliminado correctamente' },
      }));
    } catch (err) {
      setFeedbackPorSala((prev) => ({
        ...prev,
        [salaId]: {
          type: 'error',
          message: err instanceof Error ? err.message : 'Error al eliminar el alumno',
        },
      }));
    } finally {
      setProcessingAlumnoId(null);
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
            const feedback = feedbackPorSala[sala.id];
            const isSavingAsistencia = !!savingAsistencia[sala.id];

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
                </div>

                {isExpanded && (
                  <div
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      padding: '1rem 1.5rem 1.5rem 1.5rem',
                      backgroundColor: '#f7fafc',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <h4 style={{ margin: 0, color: '#2d3748' }}>Alumnos</h4>
                      <button
                        onClick={() => void handleGuardarAsistencia(sala.id)}
                        disabled={isSavingAsistencia || alumnos.length === 0}
                        style={{
                          backgroundColor: '#2d5016',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          cursor: alumnos.length === 0 ? 'not-allowed' : 'pointer',
                          opacity: alumnos.length === 0 ? 0.5 : 1,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isSavingAsistencia ? 'Guardando...' : 'Guardar Asistencia'}
                      </button>
                    </div>

                    {feedback && (
                      <div
                        style={{
                          marginBottom: '1rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '0.375rem',
                          backgroundColor: feedback.type === 'success' ? '#c6f6d5' : '#fed7d7',
                          color: feedback.type === 'success' ? '#1a472a' : '#742a2a',
                        }}
                      >
                        {feedback.message}
                      </div>
                    )}

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
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '1rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                              <input
                                type="checkbox"
                                checked={asistenciaPorSala[sala.id]?.[alumno.id] ?? false}
                                onChange={(e) => handleToggleAsistencia(sala.id, alumno.id, e.target.checked)}
                              />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {alumno.nombre} {alumno.apellido}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                              <button
                                onClick={() => void handleInactivarAlumno(sala.id, alumno)}
                                disabled={processingAlumnoId === alumno.id}
                                style={{
                                  backgroundColor: '#d69e2e',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.45rem 0.75rem',
                                  borderRadius: '0.375rem',
                                  cursor: 'pointer',
                                }}
                              >
                                Inactivar
                              </button>
                              <button
                                onClick={() => void handleEliminarAlumno(sala.id, alumno)}
                                disabled={processingAlumnoId === alumno.id}
                                style={{
                                  backgroundColor: '#e53e3e',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.45rem 0.75rem',
                                  borderRadius: '0.375rem',
                                  cursor: 'pointer',
                                }}
                              >
                                Eliminar
                              </button>
                            </div>
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
