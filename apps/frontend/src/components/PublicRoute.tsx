import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute - للصفحات العامة مثل Login
 * إذا كان المستخدم مسجل دخول، يتم تحويله للـ Dashboard
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
