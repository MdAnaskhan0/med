import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a loading spinner

  if (!user) return <Navigate to="/" />;

  const normalizedUserRole = user.role.toLowerCase().replace(/\s+/g, '');
  const normalizedAllowedRoles = allowedRoles.map(role =>
    role.toLowerCase().replace(/\s+/g, '')
  );

  return normalizedAllowedRoles.includes(normalizedUserRole) ? <Outlet /> : <Navigate to="/unauthorized" />;
};
