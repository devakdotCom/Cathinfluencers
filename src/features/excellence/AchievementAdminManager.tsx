import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, EyeOff, Globe2, Trash2, XCircle } from 'lucide-react';
import type { Achievement, AchievementStatus } from './achievementTypes';
import {
  deleteAchievement,
  reviewAchievement,
  subscribeAllAchievements,
} from './achievementRepository';

interface AchievementAdminManagerProps {
  adminUid: string;
  onAddActivityLog?: (action: string, targetId: string, targetName: string, details: string) => void;
}

const FILTERS: Array<{ id: 'pending' | AchievementStatus | 'all'; label: string }> = [
  { id: 'pending', label: 'Pending review' },
  { id: 'approved', label: 'Approved' },
  { id: 'published', label: 'Published' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
];

const STATUS_BADGE: Record<AchievementStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-300',
  approved: 'bg-sky-500/10 text-sky-300',
  published: 'bg-emerald-500/10 text-emerald-300',
  rejected: 'bg-rose-500/10 text-rose-300',
};

export default function AchievementAdminManager({
  adminUid,
  onAddActivityLog,
}: AchievementAdminManagerProps) {
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeAllAchievements(
      setAchievements,
      () => setError('Achievements could not be loaded.'),
    );
  }, []);

  const visible = useMemo(
    () => (achievements ?? []).filter(a => filter === 'all' || a.status === filter),
    [achievements, filter],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of achievements ?? []) map.set(a.status, (map.get(a.status) ?? 0) + 1);
    return map;
  }, [achievements]);

  const act = async (
    achievement: Achievement,
    status: AchievementStatus,
    logAction: string,
    reviewNote?: string,
  ) => {
    setBusyId(achievement.id);
    setError(null);
    try {
      await reviewAchievement(achievement.id, status, adminUid, reviewNote);
      onAddActivityLog?.(logAction, achievement.id, achievement.title,
        `Status set to ${status}${reviewNote ? ` with note: ${reviewNote}` : '.'}`);
      setNoteFor(null);
      setNote('');
    } catch {
      setError('Action failed. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (achievement: Achievement) => {
    setBusyId(achievement.id);
    try {
      await deleteAchievement(achievement.id);
      onAddActivityLog?.('Achievement Deleted', achievement.id, achievement.title, 'Removed permanently.');
      setConfirmDeleteId(null);
    } catch {
      setError('Delete failed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Vox Excellence administration
        </p>
        <h2 className="text-xl font-black tracking-tight text-white">Achievement review</h2>
        <p className="mt-1 text-sm text-slate-400">
          Nothing appears on the public wall until it is approved and published here.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Review filters">
        {FILTERS.map(item => (
          <button key={item.id} role="tab" aria-selected={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={`shrink-0 px-3 py-1.5 rounded-xl border-0 text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
              filter === item.id ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}>
            {item.label}
            {item.id !== 'all' && (counts.get(item.id) ?? 0) > 0 && ` (${counts.get(item.id)})`}
          </button>
        ))}
      </div>

      {achievements === null ? (
        <div className="space-y-2" aria-hidden="true">
          {[0, 1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-10 text-center text-sm text-slate-400">
          {filter === 'pending' ? 'Review queue is clear.' : 'Nothing here yet.'}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map(achievement => {
            const busy = busyId === achievement.id;
            return (
              <li key={achievement.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">{achievement.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${STATUS_BADGE[achievement.status]}`}>
                        {achievement.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {achievement.memberName}
                      {achievement.parish ? ` · ${achievement.parish}` : ''} · {achievement.category} · {achievement.achievedOn}
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{achievement.description}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
                      {achievement.imageUrl && (
                        <a href={achievement.imageUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sky-300 hover:underline">
                          <ExternalLink className="h-3 w-3" aria-hidden="true" /> Photo
                        </a>
                      )}
                      {achievement.proofUrl && (
                        <a href={achievement.proofUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sky-300 hover:underline">
                          <ExternalLink className="h-3 w-3" aria-hidden="true" /> Proof document
                        </a>
                      )}
                    </div>
                    {achievement.reviewNote && (
                      <p className="mt-2 text-[11px] text-amber-300/80">Review note: {achievement.reviewNote}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    {achievement.status === 'pending' && (
                      <>
                        <button onClick={() => act(achievement, 'approved', 'Achievement Approved')} disabled={busy}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-sky-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-sky-300 transition hover:bg-sky-500/20">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Approve
                        </button>
                        <button onClick={() => { setNoteFor(noteFor === achievement.id ? null : achievement.id); setNote(''); }} disabled={busy}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-rose-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-rose-300 transition hover:bg-rose-500/20">
                          <XCircle className="h-3.5 w-3.5" aria-hidden="true" /> Reject
                        </button>
                      </>
                    )}
                    {achievement.status === 'approved' && (
                      <button onClick={() => act(achievement, 'published', 'Achievement Published')} disabled={busy}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-emerald-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20">
                        <Globe2 className="h-3.5 w-3.5" aria-hidden="true" /> Publish
                      </button>
                    )}
                    {achievement.status === 'published' && (
                      <button onClick={() => act(achievement, 'approved', 'Achievement Unpublished')} disabled={busy}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-300 transition hover:bg-white/10">
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> Unpublish
                      </button>
                    )}
                    {confirmDeleteId === achievement.id ? (
                      <button onClick={() => handleDelete(achievement)} disabled={busy}
                        className="cursor-pointer rounded-lg border-0 bg-rose-500/20 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-rose-300 transition hover:bg-rose-500/30">
                        Confirm delete
                      </button>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(achievement.id)} disabled={busy}
                        title="Delete" aria-label={`Delete ${achievement.title}`}
                        className="cursor-pointer rounded-lg border-0 bg-white/5 p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {noteFor === achievement.id && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <input value={note} onChange={e => setNote(e.target.value)} maxLength={500}
                      placeholder="Reason / revision guidance for the submitter"
                      className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-500 focus:outline-none" />
                    <button onClick={() => act(achievement, 'rejected', 'Achievement Rejected', note.trim() || undefined)}
                      disabled={busy}
                      className="cursor-pointer rounded-xl border-0 bg-rose-500/20 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-rose-300 transition hover:bg-rose-500/30">
                      Confirm rejection
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
