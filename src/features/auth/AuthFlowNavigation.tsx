import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface AuthFlowNavigationProps {
  currentLabel: string;
  onBeforeNavigate?: () => void;
}

export function AuthFlowNavigation({
  currentLabel,
  onBeforeNavigate,
}: AuthFlowNavigationProps) {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  const destination = !user
    ? '/'
    : role === 'admin'
      ? '/admin/dashboard'
      : role === 'moderator'
        ? '/admin/reviews'
        : '/dashboard';

  const handleBack = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    onBeforeNavigate?.();
    navigate(destination);
  };

  return (
    <nav className="auth-flow-navigation" aria-label="Authentication navigation">
      <button
        type="button"
        className="auth-flow-back vox-focus"
        onClick={handleBack}
        disabled={isNavigating}
        aria-label={`Back to ${user ? 'your portal dashboard' : 'Main Portal'}`}
        aria-busy={isNavigating}
      >
        {isNavigating ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <ArrowLeft className="size-4" aria-hidden="true" />
        )}
        <span className="auth-flow-back-desktop">Back to Vox Ecclesiae</span>
        <span className="auth-flow-back-mobile">Back</span>
      </button>

      <ol className="auth-flow-breadcrumb" aria-label="Breadcrumb">
        <li>Vox Ecclesiae</li>
        <li aria-hidden="true">/</li>
        <li aria-current="page">{currentLabel}</li>
      </ol>
    </nav>
  );
}
