import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { employee } = useAuth();

  if (!employee) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && employee.role !== 'admin') {
    return <Navigate to="/log-wash" />;
  }

  return children;
}
