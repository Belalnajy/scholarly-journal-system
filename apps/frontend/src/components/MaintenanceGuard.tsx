import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSiteSettings } from '../contexts';
import { useAuth } from '../contexts';
import { UserRole } from '../types/user.types';

interface MaintenanceGuardProps {
  children: ReactNode;
}

export function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const { settings, loading } = useSiteSettings();
  const { user } = useAuth();

  // Wait for settings to load
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#093059]"></div>
      </div>
    );
  }

  // Check if maintenance mode is enabled
  const isMaintenanceMode = settings?.is_maintenance_mode || false;

  // Allow admins to bypass maintenance mode
  const isAdmin = user?.role === UserRole.ADMIN;

  // If maintenance mode is on and user is not admin, redirect to maintenance page
  if (isMaintenanceMode && !isAdmin) {
    return <Navigate to="/maintenance" replace />;
  }

  return <>{children}</>;
}
