import { AuthFlowNavigation } from '../../features/auth/AuthFlowNavigation';
import { usePortal } from '../PortalContext';

export function AuthLoadingView() {
  const { authFlowLabel } = usePortal();

  return (
    <div className="auth-flow-page relative min-h-[100svh] bg-slate-950 text-white grid place-items-center">
      <AuthFlowNavigation currentLabel={authFlowLabel} />
      <p role="status">Verifying secure session...</p>
    </div>
  );
}
