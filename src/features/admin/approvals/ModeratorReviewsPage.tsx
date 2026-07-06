import { Navigate } from 'react-router-dom';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';
import { useAuth } from '../../auth/AuthProvider';
import { ApprovalQueue } from './ApprovalQueue';

export function ModeratorReviewsPage() {
  const { user, role, loading, signOut } = useAuth();
  if (loading) {
    return <div role="status" className="grid min-h-[100svh] place-items-center bg-slate-950 text-white">Loading approval center...</div>;
  }
  if (!user || (role !== 'moderator' && role !== 'admin')) return <Navigate to="/" replace />;

  return (
    <main className="min-h-[100svh] bg-slate-950 px-4 pb-12 pt-24 text-white sm:px-6">
      <LanguageSwitcher />
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Vox Ecclesiae</p>
            <h1 className="mt-1 font-serif text-3xl font-black">Approval center</h1>
          </div>
          <button type="button" onClick={() => void signOut()} className="min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-bold text-slate-200 hover:bg-slate-900">
            Sign out
          </button>
        </header>
        <ApprovalQueue reviewerUid={user.uid} isSuperAdmin={role === 'admin'} />
      </div>
    </main>
  );
}
