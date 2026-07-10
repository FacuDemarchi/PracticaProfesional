import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useSession } from '../contexts/SessionContext';
import { apiService } from '../services/api.service';
import type { DetalleAsistencia, TomaAsistencia } from '../types';

type Feedback = {
  type: 'success' | 'error';
  message: string;
};

export const Historial = () => {
  const { token } = useSession();
  const [historial, setHistorial] = useState<TomaAsistencia[]>([]);
  const [expandedTomaId, setExpandedTomaId] = useState<number | null>(null);
  const [draftDetallesByToma, setDraftDetallesByToma] = useState<Record<number, DetalleAsistencia[]>>({});
  const [feedbackByToma, setFeedbackByToma] = useState<Record<number, Feedback | undefined>>({});
  const [loadingDetalleId, setLoadingDetalleId] = useState<number | null>(null);
  const [savingTomaId, setSavingTomaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncToma = (updatedToma: TomaAsistencia) => {
    setHistorial((prev) => prev.map((toma) => (toma.id === updatedToma.id ? updatedToma : toma)));
  };

  const initializeDraft = (toma: TomaAsistencia) => {
    setDraftDetallesByToma((prev) => ({
      ...prev,
      [toma.id]: (toma.detalles || []).map((detalle) => ({ ...detalle })),
    }));
  };

  const loadData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.getHistorial(token);
      setHistorial(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const historialOrdenado = useMemo(
    () =>
      [...historial].sort((a, b) => {
        const timestampA = new Date(`${normalizeFecha(a.fecha)}T${a.hora_creacion || '00:00:00'}`).getTime();
        const timestampB = new Date(`${normalizeFecha(b.fecha)}T${b.hora_creacion || '00:00:00'}`).getTime();
        return timestampB - timestampA;
      }),
    [historial]
  );

  const toggleToma = async (toma: TomaAsistencia) => {
    if (!token) {
      return;
    }

    const isExpanded = expandedTomaId === toma.id;
    if (isExpanded) {
      setExpandedTomaId(null);
      return;
    }

    setExpandedTomaId(toma.id);
    setFeedbackByToma((prev) => ({ ...prev, [toma.id]: undefined }));

    try {
      setLoadingDetalleId(toma.id);
      const response = await apiService.getTomaAsistenciaById(token, toma.id);
      if (response.data) {
        const tomaActualizada = {
          ...response.data,
          sala: response.data.sala || toma.sala,
          profesor: response.data.profesor || toma.profesor,
        };
        syncToma(tomaActualizada);
        initializeDraft(tomaActualizada);
        return;
      }

      initializeDraft(toma);
    } catch (err) {
      initializeDraft(toma);
      setFeedbackByToma((prev) => ({
        ...prev,
        [toma.id]: {
          type: 'error',
          message: err instanceof Error ? err.message : 'No se pudo cargar el detalle actualizado',
        },
      }));
    } finally {
      setLoadingDetalleId(null);
    }
  };

  const handleDetalleChange = (tomaId: number, alumnoId: number, presente: boolean) => {
    setDraftDetallesByToma((prev) => ({
      ...prev,
      [tomaId]: (prev[tomaId] || []).map((detalle) =>
        detalle.alumno_id === alumnoId ? { ...detalle, presente } : detalle
      ),
    }));
  };

  const handleGuardarCambios = async (toma: TomaAsistencia) => {
    if (!token) {
      return;
    }

    const detalles = draftDetallesByToma[toma.id] || [];
    if (detalles.length === 0) {
      setFeedbackByToma((prev) => ({
        ...prev,
        [toma.id]: { type: 'error', message: 'No hay detalle para actualizar en esta asistencia' },
      }));
      return;
    }

    try {
      setSavingTomaId(toma.id);
      setFeedbackByToma((prev) => ({ ...prev, [toma.id]: undefined }));

      await apiService.createOrUpdateTomaAsistencia(token, {
        salaId: toma.sala_id,
        fecha: normalizeFecha(toma.fecha),
        detalles: detalles.map((detalle) => ({
          alumnoId: detalle.alumno_id,
          presente: detalle.presente,
          observacion: detalle.observacion,
        })),
      });

      const response = await apiService.getTomaAsistenciaById(token, toma.id);
      if (response.data) {
        const tomaActualizada = {
          ...response.data,
          sala: response.data.sala || toma.sala,
          profesor: response.data.profesor || toma.profesor,
        };
        syncToma(tomaActualizada);
        initializeDraft(tomaActualizada);
      }

      setFeedbackByToma((prev) => ({
        ...prev,
        [toma.id]: { type: 'success', message: 'Asistencia actualizada correctamente' },
      }));
    } catch (err) {
      setFeedbackByToma((prev) => ({
        ...prev,
        [toma.id]: {
          type: 'error',
          message: err instanceof Error ? err.message : 'Error al guardar los cambios',
        },
      }));
    } finally {
      setSavingTomaId(null);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Cargando...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Historial de Asistencias</h2>
      </div>

      {historialOrdenado.length === 0 ? (
        <div style={styles.emptyState}>No hay registros de asistencia</div>
      ) : (
        <div style={styles.list}>
          {historialOrdenado.map((toma) => {
            const isExpanded = expandedTomaId === toma.id;
            const detalles = draftDetallesByToma[toma.id] || toma.detalles || [];
            const presentes = detalles.filter((detalle) => detalle.presente).length;
            const total = detalles.length;
            const feedback = feedbackByToma[toma.id];
            const isLoadingDetalle = loadingDetalleId === toma.id;
            const isSaving = savingTomaId === toma.id;

            return (
              <div key={toma.id} style={styles.card}>
                <button type="button" onClick={() => void toggleToma(toma)} style={styles.cardButton}>
                  <div style={styles.summaryGrid}>
                    <SummaryItem label="Sala" value={toma.sala?.nombre || `Sala ${toma.sala_id}`} />
                    <SummaryItem
                      label="Profesor"
                      value={
                        toma.profesor
                          ? `${toma.profesor.nombre} ${toma.profesor.apellido}`
                          : 'Profesor no encontrado'
                      }
                    />
                    <SummaryItem label="Fecha" value={formatFecha(toma.fecha)} />
                    <SummaryItem label="Hora" value={formatTime(toma.hora_creacion)} />
                    <div>
                      <div style={styles.summaryLabel}>Estado</div>
                      <span
                        style={{
                          ...styles.badge,
                          ...(toma.estado === 'abierta' ? styles.badgeActive : styles.badgeInactive),
                        }}
                      >
                        {toma.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                      </span>
                    </div>
                    <div style={styles.summaryRight}>
                      <strong style={styles.summaryCount}>
                        {presentes}/{total || toma.detalles?.length || 0}
                      </strong>
                      <span style={styles.summaryHint}>{isExpanded ? 'Ocultar detalle' : 'Ver detalle'}</span>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div style={styles.detailContainer}>
                    {feedback && (
                      <div
                        style={{
                          ...styles.feedback,
                          ...(feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError),
                        }}
                      >
                        {feedback.message}
                      </div>
                    )}

                    {isLoadingDetalle ? (
                      <p style={styles.detailMessage}>Cargando detalle...</p>
                    ) : detalles.length === 0 ? (
                      <p style={styles.detailMessage}>Sin detalle disponible para esta asistencia.</p>
                    ) : (
                      <>
                        <div style={styles.detailHeader}>
                          <div>
                            <h3 style={styles.detailTitle}>Detalle del día</h3>
                            <p style={styles.detailSubtitle}>
                              Marcá o desmarcá la asistencia de cada alumno y guardá los cambios.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleGuardarCambios(toma)}
                            disabled={isSaving}
                            style={{
                              ...styles.saveButton,
                              ...(isSaving ? styles.saveButtonDisabled : {}),
                            }}
                          >
                            {isSaving ? 'Guardando...' : 'Guardar cambios'}
                          </button>
                        </div>

                        <div style={styles.studentList}>
                          {detalles.map((detalle) => (
                            <div key={detalle.id} style={styles.studentRow}>
                              <div style={styles.studentInfo}>
                                <strong style={styles.studentName}>
                                  {detalle.alumno?.nombre || 'Alumno'} {detalle.alumno?.apellido || ''}
                                </strong>
                                <span
                                  style={{
                                    ...styles.studentStatus,
                                    ...(detalle.presente ? styles.studentStatusPresent : styles.studentStatusAbsent),
                                  }}
                                >
                                  {detalle.presente ? 'Presente' : 'Ausente'}
                                </span>
                              </div>

                              <label style={styles.checkboxLabel}>
                                <input
                                  type="checkbox"
                                  checked={detalle.presente}
                                  onChange={(event) =>
                                    handleDetalleChange(toma.id, detalle.alumno_id, event.target.checked)
                                  }
                                />
                                Presente
                              </label>
                            </div>
                          ))}
                        </div>
                      </>
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

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div style={styles.summaryLabel}>{label}</div>
    <div style={styles.summaryValue}>{value}</div>
  </div>
);

const normalizeFecha = (fecha: string) => (fecha.includes('T') ? fecha.split('T')[0] : fecha);

const formatFecha = (fecha: string) => {
  const fechaBase = `${normalizeFecha(fecha)}T00:00:00`;
  return new Date(fechaBase).toLocaleDateString('es-AR', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (timeStr: string) => {
  if (!timeStr) {
    return '--:--';
  }

  const [hours = '00', minutes = '00'] = timeStr.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

const styles: Record<string, CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '1.5rem',
  },
  title: {
    margin: 0,
    color: '#1a365d',
  },
  list: {
    display: 'grid',
    gap: '1rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  cardButton: {
    width: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    padding: '1.25rem 1.5rem',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#718096',
    marginBottom: '0.35rem',
    fontWeight: 600,
  },
  summaryValue: {
    color: '#2d3748',
    fontSize: '1.05rem',
  },
  summaryRight: {
    display: 'grid',
    justifyItems: 'start',
    gap: '0.25rem',
  },
  summaryCount: {
    fontSize: '1.1rem',
    color: '#1a365d',
  },
  summaryHint: {
    color: '#2d5016',
    fontWeight: 600,
  },
  badge: {
    display: 'inline-flex',
    padding: '0.3rem 0.85rem',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  badgeActive: {
    backgroundColor: '#c6f6d5',
    color: '#22543d',
  },
  badgeInactive: {
    backgroundColor: '#fed7d7',
    color: '#742a2a',
  },
  detailContainer: {
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    padding: '1.25rem 1.5rem 1.5rem',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  detailTitle: {
    margin: 0,
    color: '#1a365d',
  },
  detailSubtitle: {
    margin: '0.4rem 0 0',
    color: '#4a5568',
  },
  studentList: {
    display: 'grid',
    gap: '0.75rem',
  },
  studentRow: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    padding: '0.9rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  studentName: {
    color: '#2d3748',
  },
  studentStatus: {
    padding: '0.2rem 0.65rem',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  studentStatusPresent: {
    backgroundColor: '#ebf8ff',
    color: '#2b6cb0',
  },
  studentStatusAbsent: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#2d3748',
    fontWeight: 500,
  },
  saveButton: {
    backgroundColor: '#2d5016',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.45rem',
    padding: '0.7rem 1rem',
    cursor: 'pointer',
    fontWeight: 600,
  },
  saveButtonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  feedback: {
    marginBottom: '1rem',
    padding: '0.8rem 1rem',
    borderRadius: '0.5rem',
  },
  feedbackSuccess: {
    backgroundColor: '#c6f6d5',
    color: '#1a472a',
  },
  feedbackError: {
    backgroundColor: '#fed7d7',
    color: '#742a2a',
  },
  detailMessage: {
    margin: 0,
    color: '#4a5568',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '2rem',
    textAlign: 'center',
    color: '#718096',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
  },
  error: {
    textAlign: 'center',
    padding: '2rem',
    color: '#e53e3e',
  },
};
