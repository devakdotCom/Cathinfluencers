import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type AppRole } from './AuthProvider';

export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: Exclude<AppRole, null>;
}) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div role="status" className="min-h-[100svh] bg-slate-950 text-white grid place-items-center">Loading secure session...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
