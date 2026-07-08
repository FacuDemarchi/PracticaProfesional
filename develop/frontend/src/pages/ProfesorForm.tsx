import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { apiService } from '../services/api.service';
import type { Profesor } from '../types';

export const ProfesorForm = () => {
  const { token } = useSession();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = id && id !== 'nuevo';

  const [formData, setFormData] = useState<Omit<Profesor, 'id' | 'creado_en' | 'actualizado_en' | 'salas'> & { password?: string }>({
    nombre: '',
    apellido: '',
    habilitado: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      if (isEdit && id) {
        const profesorRes = await apiService.getProfesorById(token, parseInt(id));
        if (profesorRes.ok && profesorRes.data) {
          setFormData({
            nombre: profesorRes.data.nombre,
            apellido: profesorRes.data.apellido,
            habilitado: profesorRes.data.habilitado,
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
        await apiService.updateProfesor(token, parseInt(id), formData);
      } else {
        await apiService.createProfesor(token, formData as any);
      }

      navigate('/admin/profesores');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value,
    }));
  };

  if (loading) {
    return <div style={styles.loading}>Cargando...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/admin/profesores')} style={styles.backBtn}>
          ← Volver
        </button>
        <h2 style={styles.title}>{isEdit ? 'Editar Profesor' : 'Nuevo Profesor'}</h2>
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

        <div style={styles.formGroup}>
          <label style={styles.label}>Apellido</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>{isEdit ? 'Nueva Contraseña (opcional)' : 'Contraseña'}</label>
          <input
            type="password"
            name="password"
            value={formData.password || ''}
            onChange={handleChange}
            required={!isEdit}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroupCheckbox}>
          <input
            type="checkbox"
            name="habilitado"
            id="habilitado"
            checked={formData.habilitado}
            onChange={handleChange}
            style={styles.checkbox}
          />
          <label htmlFor="habilitado" style={styles.checkboxLabel}>
            Habilitado
          </label>
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            onClick={() => navigate('/admin/profesores')}
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
  formGroup: {
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
  formGroupCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  checkbox: {
    width: '1.25rem',
    height: '1.25rem',
  },
  checkboxLabel: {
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
