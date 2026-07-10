import { AuthLoadingView } from './views/AuthLoadingView';
import { AuthGatewayView } from './views/AuthGatewayView';
import { PortalChrome } from './views/PortalChrome';
import { WelcomePortalView } from './views/WelcomePortalView';
import { MemberFormPortalView } from './views/MemberFormPortalView';
import { MemberTrackerPortalView } from './views/MemberTrackerPortalView';
import { AdminAccessDeniedView } from './views/AdminAccessDeniedView';
import { AdminPortalView } from './views/AdminPortalView';
import { PortalOverlays } from './views/PortalOverlays';
import { usePortal } from './PortalContext';

export function PortalShell() {
  const { requiresAuthentication, authLoading, firebaseUser } = usePortal();

  if (requiresAuthentication && authLoading) {
    return <AuthLoadingView />;
  }

  if (requiresAuthentication && !firebaseUser) {
    return <AuthGatewayView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans" id="vox-app-frame">
      <PortalChrome />
      <WelcomePortalView />
      <MemberFormPortalView />
      <MemberTrackerPortalView />
      <AdminAccessDeniedView />
      <AdminPortalView />
      <PortalOverlays />
    </div>
  );
}
