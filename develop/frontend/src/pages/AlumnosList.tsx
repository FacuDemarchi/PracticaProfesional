import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { apiService } from '../services/api.service';
import type { Alumno, Sala } from '../types';

export const AlumnosList = () => {
  const { token } = useSession();
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [alumnosRes, salasRes] = await Promise.all([
        apiService.getAlumnos(token, search),
        apiService.getSalas(token),
      ]);
      if (alumnosRes.ok && alumnosRes.data) setAlumnos(alumnosRes.data);
      if (salasRes.ok && salasRes.data) setSalas(salasRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, search]);

  const getSalaName = (salaId: number) => {
    return salas.find(s => s.id === salaId)?.nombre || 'Sala no encontrada';
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
        <h2 style={styles.title}>Alumnos</h2>
        <Link to="/admin/alumnos/nuevo" style={styles.addBtn}>
          + Nuevo Alumno
        </Link>
      </div>

      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar por nombre o apellido..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.tableCell}>Nombre</th>
              <th style={styles.tableCell}>Apellido</th>
              <th style={styles.tableCell}>Sala</th>
              <th style={styles.tableCell}>Estado</th>
              <th style={styles.tableCell}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.emptyCell}>
                  No hay alumnos registrados
                </td>
              </tr>
            ) : (
              alumnos.map((alumno) => (
                <tr key={alumno.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{alumno.nombre}</td>
                  <td style={styles.tableCell}>{alumno.apellido}</td>
                  <td style={styles.tableCell}>{getSalaName(alumno.sala_id)}</td>
                  <td style={styles.tableCell}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(alumno.activo ? styles.badgeActive : styles.badgeInactive),
                      }}
                    >
                      {alumno.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <button
                      onClick={() => navigate(`/admin/alumnos/${alumno.id}`)}
                      style={styles.editBtn}
                    >
                      Editar
                    </button>
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
  searchContainer: {
    marginBottom: '1.5rem',
  },
  searchInput: {
    width: '100%',
    maxWidth: '400px',
    padding: '0.75rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '1rem',
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
  editBtn: {
    backgroundColor: '#edf2f7',
    color: '#1a365d',
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
