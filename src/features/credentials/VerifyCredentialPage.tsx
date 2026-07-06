import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, ShieldAlert } from 'lucide-react';
import { VoxEcclesiaeLogo } from '../../components/VoxEcclesiaeLogo';
import type { PublicCredential } from '../../types';
import { verifyPublicCredential } from './credentialRepository';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageProvider';
import { AuthFlowNavigation } from '../auth/AuthFlowNavigation';

export default function VerifyCredentialPage() {
  const { language, t } = useLanguage();
  const id = new URLSearchParams(window.location.search).get('id') || '';
  const [credential, setCredential] = useState<PublicCredential | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    void verifyPublicCredential(id)
      .then(setCredential)
      .catch(() => setCredential(null))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <main className="auth-flow-page grid min-h-[100svh] place-items-center bg-slate-950 px-4 py-[max(5rem,env(safe-area-inset-top))] text-white">
      <AuthFlowNavigation currentLabel="Credential Lookup" />
      <LanguageSwitcher className="auth-flow-language-switcher" />
      <section className="w-full max-w-md rounded-3xl border border-amber-500/20 bg-slate-900 p-7 text-center shadow-2xl">
        <div className="mx-auto mb-5 h-20 w-20">
          <VoxEcclesiaeLogo size="100%" />
        </div>
        {loading ? (
          <p role="status" className="text-sm text-slate-300">
            {language === 'ta' ? 'பாதுகாப்பான சான்று சரிபார்க்கப்படுகிறது...' : 'Verifying secure credential...'}
          </p>
        ) : credential ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" aria-hidden="true" />
            <h1 className="mt-4 font-display text-2xl font-bold text-amber-300">
              {t('verified')}
            </h1>
            {credential.displayNameTa && language === 'ta' && (
              <p className="mt-2 text-lg text-amber-100" lang="ta">
                {credential.displayNameTa}
              </p>
            )}
            <dl className="mt-6 space-y-3 rounded-2xl bg-slate-950/60 p-5 text-left text-sm">
              <div>
                <dt className="text-slate-500">{language === 'ta' ? 'உறுப்பினர்' : 'Member'}</dt>
                <dd className="font-bold">{credential.displayName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{language === 'ta' ? 'நிலை' : 'Status'}</dt>
                <dd>{credential.status}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{language === 'ta' ? 'மறைமாவட்டம்' : 'Diocese'}</dt>
                <dd>{credential.diocese}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{language === 'ta' ? 'செல்லுபடியாகும் நாள்' : 'Valid until'}</dt>
                <dd>{new Date(credential.expiresAt).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN')}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Credential reference</dt>
                <dd className="font-mono">{credential.id.slice(0, 12).toUpperCase()}</dd>
              </div>
            </dl>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Clock3 className="size-3" />
              Opaque, expiring, and revocable verification record
            </p>
          </>
        ) : (
          <>
            <ShieldAlert className="mx-auto h-12 w-12 text-rose-400" aria-hidden="true" />
            <h1 className="mt-4 font-display text-2xl font-bold">
              {t('invalidCredential')}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {language === 'ta'
                ? 'இந்தச் சான்று காணப்படவில்லை, காலாவதியானது அல்லது ரத்து செய்யப்பட்டுள்ளது.'
                : 'This credential is missing, expired, or has been revoked.'}
            </p>
          </>
        )}
      </section>
    </main>
  );
}
