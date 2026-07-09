import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { apiService } from '../services/api.service';
import type { Sala, TomaAsistencia } from '../types';

export const ProfesorHistorial = () => {
  const { token } = useSession();
  const [searchParams] = useSearchParams();
  const salaIdParam = searchParams.get('salaId');
  const [salas, setSalas] = useState<Sala[]>([]);
  const [selectedSalaId, setSelectedSalaId] = useState<number | null>(
    salaIdParam ? parseInt(salaIdParam) : null
  );
  const [tomas, setTomas] = useState<TomaAsistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalas = async () => {
      if (!token) return;
      try {
        const response = await apiService.getSalas(token);
        const salasData = response.data ?? [];
        setSalas(salasData);
        if (salasData.length > 0 && !selectedSalaId) {
          setSelectedSalaId(salasData[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar las salas');
      } finally {
        setLoading(false);
      }
    };

    fetchSalas();
  }, [token]);

  useEffect(() => {
    const fetchHistorial = async () => {
      if (!token || !selectedSalaId) return;
      try {
        const response = await apiService.getTomaAsistenciasBySalaId(token, selectedSalaId);
        setTomas(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el historial');
      }
    };

    fetchHistorial();
  }, [token, selectedSalaId]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Historial de Mi Sala</h2>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Seleccionar Sala:</label>
        <select
          value={selectedSalaId || ''}
          onChange={(e) => setSelectedSalaId(e.target.value ? parseInt(e.target.value) : null)}
          style={{
            padding: '0.5rem',
            borderRadius: '0.375rem',
            border: '1px solid #e2e8f0',
            minWidth: '200px',
          }}
        >
          {salas.map((sala) => (
            <option key={sala.id} value={sala.id}>
              {sala.nombre}
            </option>
          ))}
        </select>
      </div>
      {tomas.length === 0 ? (
        <p>No hay registros de asistencia para esta sala</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {tomas.map((toma) => {
            const presentes = toma.detalles?.filter((d) => d.presente).length || 0;
            const total = toma.detalles?.length || 0;
            return (
              <div
                key={toma.id}
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>
                      Fecha: {toma.fecha}
                    </h3>
                    <p style={{ margin: '0.25rem 0', color: '#666' }}>
                      Hora: {toma.hora_creacion}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
                      {presentes}/{total}
                    </p>
                    <p style={{ margin: 0, color: '#666' }}>Presentes</p>
                  </div>
                </div>
                {toma.detalles && toma.detalles.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>Detalle:</h4>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {toma.detalles.map((detalle) => (
                        <div
                          key={detalle.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.5rem 0',
                          }}
                        >
                          <span>
                            {detalle.alumno?.nombre} {detalle.alumno?.apellido}
                          </span>
                          <span
                            style={{
                              color: detalle.presente ? '#2d5016' : '#e53e3e',
                              fontWeight: 500,
                            }}
                          >
                            {detalle.presente ? 'Presente' : 'Ausente'}
                            {detalle.observacion && ` - ${detalle.observacion}`}
                          </span>
                        </div>
                      ))}
                    </div>
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
