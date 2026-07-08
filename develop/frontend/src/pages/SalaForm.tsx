import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { apiService } from '../services/api.service';
import type { Sala, Profesor } from '../types';

export const SalaForm = () => {
  const { token } = useSession();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = id && id !== 'nueva';

  const [formData, setFormData] = useState<Omit<Sala, 'id' | 'profesores'> & { profesorIds: number[] }>({
    nombre: '',
    hora_inicio: '08:00',
    hora_fin: '10:00',
    activa: true,
    profesorIds: [],
  });
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const profesoresRes = await apiService.getProfesores(token);
      if (profesoresRes.ok && profesoresRes.data) {
        setProfesores(profesoresRes.data);
      }

      if (isEdit && id) {
        const salaRes = await apiService.getSalaById(token, parseInt(id));
        if (salaRes.ok && salaRes.data) {
          setFormData({
            nombre: salaRes.data.nombre,
            hora_inicio: salaRes.data.hora_inicio,
            hora_fin: salaRes.data.hora_fin,
            activa: salaRes.data.activa,
            profesorIds: salaRes.data.profesores?.map((p) => p.id) || [],
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSaving(true);
      setError(null);

      if (isEdit && id) {
        await apiService.updateSala(token, parseInt(id), formData);
      } else {
        await apiService.createSala(token, formData);
      }

      navigate('/admin/salas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleProfesorToggle = (profesorId: number) => {
    setFormData((prev) => ({
      ...prev,
      profesorIds: prev.profesorIds.includes(profesorId)
        ? prev.profesorIds.filter((id) => id !== profesorId)
        : [...prev.profesorIds, profesorId],
    }));
  };

  if (loading) {
    return <div style={styles.loading}>Cargando...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/admin/salas')} style={styles.backBtn}>
          ← Volver
        </button>
        <h2 style={styles.title}>{isEdit ? 'Editar Sala' : 'Nueva Sala'}</h2>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Hora de Inicio</label>
            <input
              type="time"
              name="hora_inicio"
              value={formData.hora_inicio}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Hora de Fin</label>
            <input
              type="time"
              name="hora_fin"
              value={formData.hora_fin}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Profesores</label>
          <div style={styles.checkboxGroup}>
            {profesores.length === 0 ? (
              <p style={styles.noProfesores}>No hay profesores registrados</p>
            ) : (
              profesores.map((profesor) => (
                <label key={profesor.id} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.profesorIds.includes(profesor.id)}
                    onChange={() => handleProfesorToggle(profesor.id)}
                    style={styles.checkbox}
                  />
                  {profesor.nombre} {profesor.apellido}
                </label>
              ))
            )}
          </div>
        </div>

        <div style={styles.formGroupCheckbox}>
          <input
            type="checkbox"
            name="activa"
            id="activa"
            checked={formData.activa}
            onChange={handleChange}
            style={styles.checkbox}
          />
          <label htmlFor="activa" style={styles.checkboxLabelText}>
            Activa
          </label>
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            onClick={() => navigate('/admin/salas')}
            style={styles.cancelBtn}
          >
            Cancelar
          </button>
          <button type="submit" disabled={saving} style={styles.saveBtn}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  backBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#1a365d',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.5rem 0',
  },
  title: {
    margin: 0,
    color: '#1a365d',
  },
  form: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
  },
  formGroup: {
    flex: 1,
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 500,
    color: '#2d3748',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    boxSizing: 'border-box' as const,
  },
  checkboxGroup: {
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    padding: '1rem',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0',
    cursor: 'pointer',
  },
  checkbox: {
    width: '1.25rem',
    height: '1.25rem',
  },
  noProfesores: {
    color: '#718096',
    margin: 0,
  },
  formGroupCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  checkboxLabelText: {
    margin: 0,
    fontWeight: 500,
    color: '#2d3748',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  saveBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1a365d',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 500,
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
  },
  error: {
    backgroundColor: '#fed7d7',
    color: '#742a2a',
    padding: '1rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
  },
};
