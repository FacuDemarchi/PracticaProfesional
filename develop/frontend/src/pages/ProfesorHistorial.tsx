import { useEffect, useMemo, useState } from 'react';
import { useSession } from '../contexts/SessionContext';
import { apiService } from '../services/api.service';
import type { TomaAsistencia } from '../types';

export const ProfesorHistorial = () => {
  const { token } = useSession();
  const [tomas, setTomas] = useState<TomaAsistencia[]>([]);
  const [expandedTomaId, setExpandedTomaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistorial = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await apiService.getHistorial(token);
        setTomas(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el historial');
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [token]);

  const tomasOrdenadas = useMemo(
    () =>
      [...tomas].sort((a, b) => {
        const fechaA = a.fecha.split('T')[0];
        const fechaB = b.fecha.split('T')[0];
        const timestampA = new Date(`${fechaA}T${a.hora_creacion || '00:00:00'}`).getTime();
        const timestampB = new Date(`${fechaB}T${b.hora_creacion || '00:00:00'}`).getTime();
        return timestampB - timestampA;
      }),
    [tomas]
  );

  const formatFecha = (fecha: string) => {
    const fechaBase = fecha.includes('T') ? fecha : `${fecha}T00:00:00`;
    return new Date(fechaBase).toLocaleDateString('es-AR', {
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Historial</h2>
      {tomasOrdenadas.length === 0 ? (
        <p>No hay registros de asistencia cargados</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {tomasOrdenadas.map((toma) => {
            const presentes = toma.detalles?.filter((d) => d.presente).length || 0;
            const total = toma.detalles?.length || 0;
            const presentesDetalle = toma.detalles?.filter((d) => d.presente) || [];
            const ausentesDetalle = toma.detalles?.filter((d) => !d.presente) || [];
            const isExpanded = expandedTomaId === toma.id;

            return (
              <div
                key={toma.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedTomaId(isExpanded ? null : toma.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.5rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>
                      Fecha: {formatFecha(toma.fecha)}
                    </h3>
                    <p style={{ margin: '0.25rem 0', color: '#666' }}>
                      Hora: {toma.hora_creacion}
                    </p>
                    <p style={{ margin: '0.25rem 0 0', color: '#666' }}>
                      Sala: {toma.sala?.nombre || `Sala ${toma.sala_id}`}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
                      {presentes}/{total}
                    </p>
                    <p style={{ margin: 0, color: '#666' }}>Presentes</p>
                    <p style={{ margin: '0.5rem 0 0', color: '#2d5016', fontWeight: 600 }}>
                      {isExpanded ? 'Ocultar detalle' : 'Ver detalle'}
                    </p>
                  </div>
                </button>
                {isExpanded && toma.detalles && toma.detalles.length > 0 && (
                  <div
                    style={{
                      padding: '0 1.5rem 1.5rem',
                      borderTop: '1px solid #e2e8f0',
                    }}
                  >
                    <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Detalle:</h4>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: '#f0fff4',
                          border: '1px solid #c6f6d5',
                          borderRadius: '0.5rem',
                          padding: '1rem',
                        }}
                      >
                        <h5 style={{ margin: '0 0 0.75rem 0', color: '#2d5016' }}>Presentes</h5>
                        {presentesDetalle.length === 0 ? (
                          <p style={{ margin: 0, color: '#666' }}>Sin presentes</p>
                        ) : (
                          <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {presentesDetalle.map((detalle) => (
                              <div key={detalle.id} style={{ color: '#2d3748' }}>
                                {detalle.alumno?.nombre} {detalle.alumno?.apellido}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          backgroundColor: '#fff5f5',
                          border: '1px solid #fed7d7',
                          borderRadius: '0.5rem',
                          padding: '1rem',
                        }}
                      >
                        <h5 style={{ margin: '0 0 0.75rem 0', color: '#c53030' }}>Ausentes</h5>
                        {ausentesDetalle.length === 0 ? (
                          <p style={{ margin: 0, color: '#666' }}>Sin ausentes</p>
                        ) : (
                          <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {ausentesDetalle.map((detalle) => (
                              <div key={detalle.id} style={{ color: '#2d3748' }}>
                                {detalle.alumno?.nombre} {detalle.alumno?.apellido}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {isExpanded && (!toma.detalles || toma.detalles.length === 0) && (
                  <div
                    style={{
                      padding: '1rem 1.5rem 1.5rem',
                      borderTop: '1px solid #e2e8f0',
                      color: '#666',
                    }}
                  >
                    Sin detalle disponible para esta toma.
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
