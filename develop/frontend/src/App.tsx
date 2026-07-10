import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './pages/AdminLayout';
import { SalasList } from './pages/SalasList';
import { SalaForm } from './pages/SalaForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useSession } from './contexts/SessionContext';
import { ProfesoresList } from './pages/ProfesoresList';
import { ProfesorForm } from './pages/ProfesorForm';
import { Historial } from './pages/Historial';
import { ProfesorLayout } from './pages/ProfesorLayout';
import { ProfesorMisSalas } from './pages/ProfesorMisSalas';
import { ProfesorTomaAsistencia } from './pages/ProfesorTomaAsistencia';
import { ProfesorHistorial } from './pages/ProfesorHistorial';
import { ProfesorAltaAlumno } from './pages/ProfesorAltaAlumno';

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
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/salas" replace />} />
        <Route path="salas" element={<SalasList />} />
        <Route path="salas/:id" element={<SalaForm />} />
        <Route path="profesores" element={<ProfesoresList />} />
        <Route path="profesores/:id" element={<ProfesorForm />} />
        <Route path="historial" element={<Historial />} />
      </Route>
      <Route path="/profesor" element={
        <ProtectedRoute allowedRoles={['profesor']}>
          <ProfesorLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/profesor/salas" replace />} />
        <Route path="salas" element={<ProfesorMisSalas />} />
        <Route path="salas/:salaId/asistencia" element={<ProfesorTomaAsistencia />} />
        <Route path="historial" element={<ProfesorHistorial />} />
        <Route path="alumnos/nuevo" element={<ProfesorAltaAlumno />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
