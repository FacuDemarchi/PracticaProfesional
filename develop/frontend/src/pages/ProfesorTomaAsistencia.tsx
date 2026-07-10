import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { apiService } from '../services/api.service';
import type { Alumno, Sala, TomaAsistencia } from '../types';

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatLocalTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export const ProfesorTomaAsistencia = () => {
  const { salaId } = useParams<{ salaId: string }>();
  const { token } = useSession();
  const navigate = useNavigate();
  const [sala, setSala] = useState<Sala | null>(null);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [tomaExistente, setTomaExistente] = useState<TomaAsistencia | null>(null);
  const [asistencias, setAsistencias] = useState<Record<number, boolean>>({});
  const [observaciones, setObservaciones] = useState<Record<number, string>>({});
  const fecha = formatLocalDate(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResumen, setShowResumen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !salaId) return;
      try {
        const [salaResponse, alumnosResponse] = await Promise.all([
          apiService.getSalaById(token, parseInt(salaId)),
          apiService.getAlumnosBySalaId(token, parseInt(salaId)),
        ]);
        setSala(salaResponse.data || null);
        const alumnosActivos = (alumnosResponse.data || []).filter((a) => a.activo);
        setAlumnos(alumnosActivos);
        const initialAsistencias: Record<number, boolean> = {};
        alumnosActivos.forEach((a) => {
          initialAsistencias[a.id] = false;
        });
        setAsistencias(initialAsistencias);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, salaId]);

  const handleGuardar = async () => {
    if (!token || !salaId) return;
    setSaving(true);
    try {
      const now = new Date();
      const detalles = alumnos.map((alumno) => ({
        alumnoId: alumno.id,
        presente: asistencias[alumno.id] ?? false,
        observacion: observaciones[alumno.id],
      }));
      const response = await apiService.createOrUpdateTomaAsistencia(token, {
        salaId: parseInt(salaId),
        fecha,
        fechaActual: formatLocalDate(now),
        horaActual: formatLocalTime(now),
        detalles,
      });
      setTomaExistente(response.data || null);
      setShowResumen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la asistencia');
    } finally {
      setSaving(false);
    }
  };

  const presentes = Object.values(asistencias).filter(Boolean).length;
  const ausentes = alumnos.length - presentes;

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (showResumen && tomaExistente) {
    return (
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem' }}>
        <h2>Resumen de Asistencia</h2>
        <p style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>
          Sala: {sala?.nombre}
        </p>
        <p style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>
          Fecha: {fecha}
        </p>
        <div style={{ display: 'flex', gap: '2rem', margin: '1.5rem 0' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d5016', margin: 0 }}>
              {presentes}
            </p>
            <p style={{ color: '#666', margin: '0.25rem 0' }}>Presentes</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e53e3e', margin: 0 }}>
              {ausentes}
            </p>
            <p style={{ color: '#666', margin: '0.25rem 0' }}>Ausentes</p>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowResumen(false)}
            style={{
              backgroundColor: '#4a5568',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          >
            Volver a Editar
          </button>
          <button
            onClick={() => navigate('/profesor/salas')}
            style={{
              backgroundColor: '#2d5016',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          >
            Volver a Mis Salas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Tomar Asistencia</h2>
      <p style={{ color: '#666', margin: '0.5rem 0 1rem 0' }}>
        Sala: {sala?.nombre}
      </p>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Fecha:</label>
        <input
          type="date"
          value={fecha}
          readOnly
          style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0', backgroundColor: '#f7fafc' }}
        />
      </div>
      {alumnos.length === 0 ? (
        <p>No hay alumnos activos en esta sala</p>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem' }}>
          {alumnos.map((alumno) => (
            <div
              key={alumno.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 0',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 500 }}>
                  {alumno.nombre} {alumno.apellido}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Observación (opcional)"
                  value={observaciones[alumno.id] || ''}
                  onChange={(e) =>
                    setObservaciones({ ...observaciones, [alumno.id]: e.target.value })
                  }
                  style={{
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #e2e8f0',
                    width: '200px',
                  }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={asistencias[alumno.id] ?? false}
                    onChange={(e) =>
                      setAsistencias({ ...asistencias, [alumno.id]: e.target.checked })
                    }
                  />
                  Presente
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => navigate('/profesor/salas')}
          style={{
            backgroundColor: '#4a5568',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          disabled={saving || alumnos.length === 0}
          style={{
            backgroundColor: '#2d5016',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            cursor: alumnos.length === 0 ? 'not-allowed' : 'pointer',
            opacity: alumnos.length === 0 ? 0.5 : 1,
          }}
        >
          {saving ? 'Guardando...' : 'Guardar Asistencia'}
        </button>
      </div>
    </div>
  );
};
