import { useSession } from '../contexts/SessionContext';
import { useNavigate } from 'react-router-dom';

export const ProfesorDashboard = () => {
  const { user, logout } = useSession();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Panel Profesor</h1>
      <p>Bienvenido, {user?.nombre ? `${user.nombre} ${user.apellido || ''}` : 'Profesor'}!</p>
      <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Cerrar Sesión
      </button>
    </div>
  );
};
