import { Navigate } from 'react-router-dom';

import { useAuth } from 'context/AuthContext';

type ProtectedRouteProps = {
  children: JSX.Element;
  adminOnly?: boolean;
};

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="py-16 text-center text-ink/60">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
