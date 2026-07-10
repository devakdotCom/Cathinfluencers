import { ExternalLink } from 'lucide-react';
import { VoxShield } from '../../components/VoxShield';
import { AuthFlowNavigation } from '../../features/auth/AuthFlowNavigation';
import { usePortal } from '../PortalContext';

export function AuthGatewayView() {
  const {
    authFlowLabel,
    resetAuthFlowForPortalReturn,
    isFirebaseQuotaExceeded,
    authMode,
    adminLoginError,
    adminLoginInput,
    setAdminLoginInput,
    adminLoginPassword,
    setAdminLoginPassword,
    authSubmitting,
    handleSecureLogin,
    setAdminLoginError,
    setAuthMode,
  } = usePortal();

  return (
    <div
      className="auth-flow-page min-h-screen flex items-center justify-center p-6 text-white relative font-sans bg-slate-950"
      id="universal-security-gateway"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(13, 10, 27, 0.95), rgba(5, 3, 13, 0.98)), url('https://upload.wikimedia.org/wikipedia/commons/e/ee/San_Thome_Basilica%2C_Chennai.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <AuthFlowNavigation
        currentLabel={authFlowLabel}
        onBeforeNavigate={resetAuthFlowForPortalReturn}
      />
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-[#05030d]/80 z-0 opacity-85 pointer-events-none" />

      <div className="flex flex-col gap-4 max-w-md w-full z-10 animate-fade-in animate-duration-300">
        {isFirebaseQuotaExceeded && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-200 flex flex-col gap-2 relative overflow-hidden shadow-xl" id="firebase-quota-alert-login">
            <div className="flex items-start gap-2">
              <span className="text-[14px] mt-0.5">⚠️</span>
              <div>
                <h4 className="text-amber-400 font-bold uppercase tracking-wider text-[10px] mb-1">Cloud Registry Quota Notice</h4>
                <p className="leading-relaxed">
                  This database has reached its current write allowance. Existing data remains readable, but editing is temporarily unavailable until quota resets or billing limits are adjusted.
                </p>
              </div>
            </div>
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noopener noreferrer"
              className="text-[9px] font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1.5 rounded-lg transition-colors font-sans flex items-center justify-center gap-1 mt-1 shrink-0"
            >
              <span>Diagnose Database In Firebase</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}

        <div className="w-full bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-2xl p-8 shadow-2xl relative overflow-hidden" id="admin-login-box">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-600 font-sans" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 115%, rgba(245,189,50,.08), transparent 70%)' }} />

          <div className="text-center space-y-4 mb-6 relative">
            <div className="w-16 h-16 mx-auto filter drop-shadow-[0_8px_20px_rgba(245,189,50,0.3)]">
              <VoxShield size="100%" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">Vox Ecclesiae · Faith · Formation · Community</span>
              <h3 className="text-2xl font-display font-semibold uppercase tracking-wider text-white mt-2">
                {authMode === 'reset'
                  ? 'Reset Your Password'
                  : authMode === 'register'
                    ? 'Create Your Account'
                    : 'Welcome Back'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2 select-none font-medium">
                {authMode === 'reset'
                  ? 'Enter your registered email address and we will send a secure password reset link.'
                  : authMode === 'register'
                    ? 'Start your Catholic digital identity and membership journey.'
                    : 'Sign in to your ministry workspace, courses, and verified Vox ID.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSecureLogin} className="space-y-4" id="admin-login-form">
            {adminLoginError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg p-3 text-xs font-bold leading-relaxed" id="login-error-banner">
                ⚠️ {adminLoginError}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="secure-login-email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Registered email address *</label>
              <input
                id="secure-login-email"
                type="email"
                autoComplete="email"
                required
                value={adminLoginInput}
                onChange={(e) => setAdminLoginInput(e.target.value)}
                placeholder="name@example.org"
                className="w-full min-h-11 text-xs p-3.5 bg-slate-900 border border-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 rounded-xl font-sans text-white focus:bg-slate-900/65 font-medium transition"
              />
            </div>

            {authMode !== 'reset' && (
              <div className="space-y-1.5">
                <label htmlFor="secure-login-password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Password *</label>
                <input
                  id="secure-login-password"
                  type="password"
                  autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                  required
                  minLength={8}
                  value={adminLoginPassword}
                  onChange={(e) => setAdminLoginPassword(e.target.value)}
                  className="w-full min-h-11 text-xs p-3.5 bg-slate-900 border border-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 rounded-xl font-sans text-white"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full min-h-11 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-450 hover:to-amber-550 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition active:scale-95 cursor-pointer mt-2 disabled:cursor-wait disabled:opacity-70"
            >
              {authSubmitting
                ? 'Please wait...'
                : authMode === 'reset'
                  ? 'Send Reset Link'
                  : authMode === 'register'
                    ? 'Create Account'
                    : 'Sign In'}
            </button>

            {authMode === 'sign-in' && (
              <button
                type="button"
                onClick={() => {
                  setAdminLoginError('');
                  setAuthMode('reset');
                }}
                className="w-full min-h-11 text-xs font-bold text-slate-300 hover:text-amber-300 underline underline-offset-4"
              >
                Forgot password?
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setAuthMode(current => current === 'sign-in' ? 'register' : 'sign-in');
                setAdminLoginError('');
              }}
              className="w-full min-h-11 text-xs font-bold text-amber-300 hover:text-white underline"
            >
              {authMode === 'register'
                ? 'Already registered? Sign in'
                : authMode === 'reset'
                  ? 'Return to sign in'
                  : 'New member? Create an account'}
            </button>
          </form>

          <div className="mt-5 text-center border-t border-slate-850/60 pt-4">
            <p className="text-[11px] text-slate-400 leading-normal">
              Not a member yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setAdminLoginError('');
                  setAdminLoginInput('');
                  setAuthMode('register');
                }}
                className="text-amber-400 font-bold hover:text-white transition underline cursor-pointer"
              >
                Join Vox Ecclesiae, create your account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
