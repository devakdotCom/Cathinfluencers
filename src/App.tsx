import { Suspense } from 'react';
import { PortalProvider } from './app/PortalContext';
import { PortalShell } from './app/PortalShell';
import type { PortalInitProps } from './app/types';

export default function App({
  initialPortalMode,
  initialAuthMode,
  initialPublicSection,
}: PortalInitProps) {
  return (
    <Suspense
      fallback={(
        <div className="min-h-[100dvh] bg-slate-950 text-amber-300 flex items-center justify-center px-6 text-center">
          <div role="status" aria-live="polite" className="space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full border-2 border-amber-500/25 border-t-amber-400 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Loading portal</p>
          </div>
        </div>
      )}
    >
      <PortalProvider
        initialPortalMode={initialPortalMode}
        initialAuthMode={initialAuthMode}
        initialPublicSection={initialPublicSection}
      >
        <PortalShell />
      </PortalProvider>
    </Suspense>
  );
}
