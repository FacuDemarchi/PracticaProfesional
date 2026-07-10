import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';

export const ProfesorLayout = () => {
  const { user, logout } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const displayName =
    user?.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : 'Profesor';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/profesor/salas', label: 'Mis Salas' },
    { path: '/profesor/historial', label: 'Historial' },
    { path: '/profesor/alumnos/nuevo', label: 'Alta de Alumno' },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Panel Profesor</h1>
          <p style={styles.welcome}>Bienvenido, {displayName}</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Cerrar Sesión
        </button>
      </header>

      <nav style={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.navLink,
              ...(location.pathname.startsWith(item.path) ? styles.navLinkActive : {}),
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2d5016',
    color: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
  },
  welcome: {
    margin: 0,
    opacity: 0.9,
  },
  logoutBtn: {
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  nav: {
    backgroundColor: 'white',
    padding: '0 2rem',
    display: 'flex',
    gap: '0.25rem',
    borderBottom: '1px solid #e2e8f0',
  },
  navLink: {
    padding: '1rem 1.5rem',
    textDecoration: 'none',
    color: '#4a5568',
    fontWeight: 500,
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s',
  },
  navLinkActive: {
    color: '#2d5016',
    borderBottomColor: '#2d5016',
    backgroundColor: '#f7fafc',
  },
  main: {
    padding: '2rem',
  },
};
