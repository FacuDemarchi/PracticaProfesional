import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfesorDashboard } from './pages/ProfesorDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useSession } from './contexts/SessionContext';

function App() {
  const { isAuthenticated, user } = useSession();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? (
          user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/profesor" replace />
        ) : (
          <LoginPage />
        )
      } />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/profesor" element={
        <ProtectedRoute allowedRoles={['profesor']}>
          <ProfesorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

