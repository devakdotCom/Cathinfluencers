import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { goToMarketingHome } from '../../utils/marketingNavigation';

interface AuthFlowNavigationProps {
  currentLabel: string;
  onBeforeNavigate?: () => void;
}

export function AuthFlowNavigation({
  currentLabel,
  onBeforeNavigate,
}: AuthFlowNavigationProps) {
  const [isNavigating, setIsNavigating] = useState(false);

  const handleBack = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    onBeforeNavigate?.();
    goToMarketingHome();
  };

  return (
    <nav className="auth-flow-navigation" aria-label="Authentication navigation">
      <button
        type="button"
        className="auth-flow-back vox-focus"
        onClick={handleBack}
        disabled={isNavigating}
        aria-label="Back to Vox Ecclesiae landing page"
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
