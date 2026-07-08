import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { apiService } from '../services/api.service';
import type { Profesor } from '../types';

export const ProfesoresList = () => {
  const { token } = useSession();
  const navigate = useNavigate();
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const profesoresRes = await apiService.getProfesores(token);
      if (profesoresRes.ok && profesoresRes.data) setProfesores(profesoresRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!token || !confirm('¿Está seguro de eliminar este profesor?')) return;
    try {
      await apiService.deleteProfesor(token, id);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
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
        <h2 style={styles.title}>Profesores</h2>
        <Link to="/admin/profesores/nuevo" style={styles.addBtn}>
          + Nuevo Profesor
        </Link>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.tableCell}>Nombre</th>
              <th style={styles.tableCell}>Apellido</th>
              <th style={styles.tableCell}>Estado</th>
              <th style={styles.tableCell}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {profesores.length === 0 ? (
              <tr>
                <td colSpan={4} style={styles.emptyCell}>
                  No hay profesores registrados
                </td>
              </tr>
            ) : (
              profesores.map((profesor) => (
                <tr key={profesor.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{profesor.nombre}</td>
                  <td style={styles.tableCell}>{profesor.apellido}</td>
                  <td style={styles.tableCell}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(profesor.habilitado ? styles.badgeActive : styles.badgeInactive),
                      }}
                    >
                      {profesor.habilitado ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.actions}>
                      <button
                        onClick={() => navigate(`/admin/profesores/${profesor.id}`)}
                        style={styles.editBtn}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(profesor.id)}
                        style={styles.deleteBtn}
                      >
                        Eliminar
                      </button>
                    </div>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    margin: 0,
    color: '#1a365d',
  },
  addBtn: {
    backgroundColor: '#1a365d',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    textDecoration: 'none',
    fontWeight: 500,
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
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editBtn: {
    backgroundColor: '#edf2f7',
    color: '#1a365d',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  deleteBtn: {
    backgroundColor: '#fed7d7',
    color: '#742a2a',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
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
