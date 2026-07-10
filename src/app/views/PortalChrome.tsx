import { ChevronRight, ExternalLink } from 'lucide-react';
import { usePortal } from '../PortalContext';

export function PortalChrome() {
  const {
    isAdminAuthenticated,
    portalMode,
    setPortalMode,
    setTrackerActiveMember,
    setAdminTab,
    isFirebaseQuotaExceeded,
    setIsFirebaseQuotaExceeded,
  } = usePortal();

  return (
    <>
      {isAdminAuthenticated && (
        <div className="bg-slate-950 p-2 text-center text-[9px] md:text-[10px] uppercase font-bold tracking-wider md:tracking-widest text-amber-300 flex items-center justify-between gap-3 px-3 md:px-6 border-b border-amber-500/10 z-50 sticky top-0 md:h-8" id="persistent-portal-linkbar">
          <span>🕊️ Vox Ecclesiae • Catholic Digital Commission Registry</span>

          <div className="flex gap-2 md:gap-4 shrink-0">
            {portalMode !== 'welcome' && (
              <button
                type="button"
                onClick={() => {
                  setPortalMode('welcome');
                  setTrackerActiveMember(null);
                }}
                className="text-white hover:text-amber-200 transition underline cursor-cmd"
              >
                Main Entry
              </button>
            )}

            {portalMode !== 'admin' && portalMode !== 'directory' && portalMode !== 'analytics' && portalMode !== 'import-export' && portalMode !== 'audit-logs' ? (
              <button
                type="button"
                onClick={() => {
                  setPortalMode('admin');
                  setAdminTab('dashboard');
                }}
                className="text-amber-300 hover:text-white transition flex items-center gap-1 cursor-cmd"
              >
                <span>Switch to Clergy Admin Portal 🔑</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPortalMode('welcome')}
                className="text-amber-300 hover:text-white transition flex items-center gap-1 cursor-cmd"
              >
                <span>Switch to Applicant &amp; Member Portal 🕊️</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {isFirebaseQuotaExceeded && (
        <div className="bg-amber-55 border-b border-amber-500/25 px-3 md:px-6 py-3 text-xs text-slate-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 z-50 sticky top-0 md:top-8" id="firebase-quota-alert-banner">
          <div className="flex items-start gap-2">
            <span className="text-base mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold text-slate-900 leading-normal">
                Cloud Database Quota Active
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px] mt-0.5">
                The cloud database has reached its current write allowance. Editing is temporarily unavailable; existing cloud data remains readable. Retry after the quota resets or review project billing and usage.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsFirebaseQuotaExceeded(false)}
              className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              Acknowledge &amp; Retry
            </button>
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noopener noreferrer"
              className="text-[10px] font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-450 text-slate-950 px-3 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5"
            >
              <span>Review In Firebase</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
