import { Navigate } from 'react-router-dom';
import { usarAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export function PrivateRoute({ children, requiredRole = null }) {
  const { estaAutenticado, usuario, cargando } = usarAuth();

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && usuario.rol !== requiredRole) {
    return <p>No tienes permisos para acceder a esta página.</p>;
  }

  return children;
}