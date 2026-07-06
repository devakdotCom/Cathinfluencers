import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function RoleLanding() {
  const { user, role, loading } = useAuth();
  if (loading) {
    return (
      <div role="status" className="grid min-h-[100svh] place-items-center bg-slate-950 text-white">
        Resolving your workspace...
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'moderator') return <Navigate to="/admin/reviews" replace />;
  return <Navigate to="/dashboard" replace />;
}
