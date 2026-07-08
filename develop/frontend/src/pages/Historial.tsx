import { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { apiService } from '../services/api.service';
import type { TomaAsistencia } from '../types';

export const Historial = () => {
  const { token } = useSession();
  const [historial, setHistorial] = useState<TomaAsistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await apiService.getHistorial(token);
      if (response.ok && response.data) {
        setHistorial(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
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

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.tableCell}>Sala</th>
              <th style={styles.tableCell}>Profesor</th>
              <th style={styles.tableCell}>Fecha</th>
              <th style={styles.tableCell}>Hora</th>
              <th style={styles.tableCell}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {historial.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.emptyCell}>
                  No hay registros de asistencia
                </td>
              </tr>
            ) : (
              historial.map((asistencia) => (
                <tr key={asistencia.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{asistencia.sala?.nombre || 'Sala no encontrada'}</td>
                  <td style={styles.tableCell}>
                    {asistencia.profesor ? `${asistencia.profesor.nombre} ${asistencia.profesor.apellido}` : 'Profesor no encontrado'}
                  </td>
                  <td style={styles.tableCell}>{formatDate(asistencia.fecha)}</td>
                  <td style={styles.tableCell}>{formatTime(asistencia.hora_creacion)}</td>
                  <td style={styles.tableCell}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(asistencia.estado === 'abierta' ? styles.badgeActive : styles.badgeInactive),
                      }}
                    >
                      {asistencia.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
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
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#f7fafc',
  },
  tableCell: {
    padding: '1rem',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0',
  },
  tableRow: {},
  emptyCell: {
    padding: '2rem',
    textAlign: 'center',
    color: '#718096',
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  badgeActive: {
    backgroundColor: '#c6f6d5',
    color: '#22543d',
  },
  badgeInactive: {
    backgroundColor: '#fed7d7',
    color: '#742a2a',
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
