import { useEffect, useMemo, useState } from 'react';
import { Award, Medal, Plus, Share2, Trophy } from 'lucide-react';
import type { Achievement, AchievementCategory, AchievementFormValues } from './achievementTypes';
import { ACHIEVEMENT_CATEGORIES, EMPTY_ACHIEVEMENT_FORM } from './achievementTypes';
import {
  submitAchievement,
  subscribeMyAchievements,
  subscribePublishedAchievements,
} from './achievementRepository';

interface AchievementWallProps {
  memberUid?: string;
  memberName?: string;
  onRequireSignIn: () => void;
  onAddActivityLog?: (action: string, targetId: string, targetName: string, details: string) => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-500 focus:outline-none';
const labelClass = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5';

const STATUS_BADGE: Record<Achievement['status'], string> = {
  pending: 'bg-amber-500/10 text-amber-300',
  approved: 'bg-sky-500/10 text-sky-300',
  published: 'bg-emerald-500/10 text-emerald-300',
  rejected: 'bg-rose-500/10 text-rose-300',
};

export default function AchievementWall({
  memberUid,
  memberName,
  onRequireSignIn,
  onAddActivityLog,
}: AchievementWallProps) {
  const [published, setPublished] = useState<Achievement[] | null>(null);
  const [mine, setMine] = useState<Achievement[]>([]);
  const [category, setCategory] = useState<'all' | AchievementCategory>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AchievementFormValues>(EMPTY_ACHIEVEMENT_FORM);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribePublishedAchievements(
      setPublished,
      () => setNotice({ kind: 'err', text: 'Achievements could not be loaded right now.' }),
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!memberUid) {
      setMine([]);
      return;
    }
    return subscribeMyAchievements(memberUid, setMine, () => undefined);
  }, [memberUid]);

  const visible = useMemo(
    () => (published ?? []).filter(a => category === 'all' || a.category === category),
    [published, category],
  );

  const presentCategories = useMemo(() => {
    const present = new Set((published ?? []).map(a => a.category));
    return ACHIEVEMENT_CATEGORIES.filter(c => present.has(c));
  }, [published]);

  const set = <K extends keyof AchievementFormValues>(key: K, value: AchievementFormValues[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const openForm = () => {
    if (!memberUid) {
      onRequireSignIn();
      return;
    }
    setForm({ ...EMPTY_ACHIEVEMENT_FORM, memberName: memberName ?? '' });
    setShowForm(true);
    setNotice(null);
  };

  const handleSubmit = async () => {
    if (!memberUid) return;
    if (!form.title.trim() || !form.description.trim() || !form.memberName.trim()) {
      setNotice({ kind: 'err', text: 'Title, name, and story are required.' });
      return;
    }
    setBusy(true);
    try {
      const achievement = await submitAchievement(form, memberUid);
      onAddActivityLog?.(
        'Achievement Submitted',
        achievement.id,
        achievement.title,
        `Submitted for review in category ${achievement.category}.`,
      );
      setNotice({
        kind: 'ok',
        text: 'Submitted. Your achievement will appear on the wall once the commission approves and publishes it.',
      });
      setShowForm(false);
    } catch (error) {
      setNotice({
        kind: 'err',
        text: error instanceof Error ? error.message : 'Submission failed. Please try again.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async (achievement: Achievement) => {
    const text = `${achievement.title} · ${achievement.memberName} · Vox Excellence, Voice of the Church`;
    const url = 'https://www.voxecclesiae.in/';
    try {
      if (navigator.share) {
        await navigator.share({ title: achievement.title, text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
      }
      setSharedId(achievement.id);
      setTimeout(() => setSharedId(null), 2000);
    } catch {
      /* user cancelled share; nothing to do */
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Vox Excellence · Voice of the Church
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Wall of achievements
          </h2>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Recognizing growth, commitment, and service to the mission of the Church. Every story
            here was reviewed and published by the commission.
          </p>
        </div>
        <button
          onClick={openForm}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-amber-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {memberUid ? 'Submit achievement' : 'Sign in to submit'}
        </button>
      </div>

      {notice && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
            notice.kind === 'ok'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          {notice.text}
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 p-5">
          <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-amber-300">
            Submit an achievement for review
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="ach-title">Achievement title *</label>
              <input id="ach-title" className={inputClass} value={form.title} maxLength={160}
                onChange={e => set('title', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="ach-name">Member / student name *</label>
              <input id="ach-name" className={inputClass} value={form.memberName} maxLength={200}
                onChange={e => set('memberName', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="ach-category">Category</label>
              <select id="ach-category" className={inputClass} value={form.category}
                onChange={e => set('category', e.target.value as AchievementCategory)}>
                {ACHIEVEMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="ach-desc">Short story *</label>
              <textarea id="ach-desc" className={inputClass} rows={3} value={form.description}
                maxLength={1200} onChange={e => set('description', e.target.value)}
                placeholder="What was achieved, and how it serves the mission" />
            </div>
            <div>
              <label className={labelClass} htmlFor="ach-date">Date achieved</label>
              <input id="ach-date" type="date" className={inputClass} value={form.achievedOn}
                onChange={e => set('achievedOn', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="ach-parish">Parish / church</label>
              <input id="ach-parish" className={inputClass} value={form.parish} maxLength={150}
                onChange={e => set('parish', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="ach-image">Photo URL (Cloudinary)</label>
              <input id="ach-image" className={inputClass} value={form.imageUrl}
                placeholder="https://res.cloudinary.com/…" onChange={e => set('imageUrl', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="ach-proof">Proof document / image URL</label>
              <input id="ach-proof" className={inputClass} value={form.proofUrl}
                placeholder="https://…" onChange={e => set('proofUrl', e.target.value)} />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={handleSubmit} disabled={busy}
              className="cursor-pointer rounded-xl border-0 bg-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-400 disabled:opacity-60">
              {busy ? 'Submitting…' : 'Submit for review'}
            </button>
            <button onClick={() => setShowForm(false)} disabled={busy}
              className="cursor-pointer rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 transition hover:bg-white/5">
              Cancel
            </button>
          </div>
        </div>
      )}

      {presentCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Achievement categories">
          {(['all', ...presentCategories] as const).map(item => (
            <button key={item} role="tab" aria-selected={category === item}
              onClick={() => setCategory(item as 'all' | AchievementCategory)}
              className={`shrink-0 px-3 py-1.5 rounded-xl border-0 text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
                category === item ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}>
              {item === 'all' ? 'All' : item}
            </button>
          ))}
        </div>
      )}

      {published === null && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
          {[0, 1, 2].map(i => <div key={i} className="h-60 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      )}

      {published !== null && visible.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center">
          <Trophy className="mx-auto mb-3 h-8 w-8 text-slate-500" aria-hidden="true" />
          <p className="text-sm font-bold text-slate-300">No published achievements yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Approved stories of excellence will appear here for the whole community to celebrate.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map(achievement => (
          <article key={achievement.id}
            className="relative flex flex-col overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-900 to-slate-950 p-5 transition hover:border-amber-500/50 hover:shadow-[0_14px_45px_rgb(245_158_11/0.12)]">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300">
                <Medal className="h-3 w-3" aria-hidden="true" /> {achievement.category}
              </span>
              <span className="text-[11px] text-slate-500">
                {new Date(achievement.achievedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            {achievement.imageUrl && (
              <img src={achievement.imageUrl} alt="" loading="lazy"
                className="mb-3 h-40 w-full rounded-xl object-cover" />
            )}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950">
                <Award className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black leading-snug tracking-tight text-white">{achievement.title}</h3>
                <p className="text-[13px] font-bold text-amber-200/90">{achievement.memberName}</p>
                {achievement.parish && <p className="text-[11px] text-slate-500">{achievement.parish}</p>}
              </div>
            </div>
            <p className="mt-3 flex-1 text-[13px] leading-relaxed text-slate-400">{achievement.description}</p>
            <button onClick={() => handleShare(achievement)}
              className="mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-700 bg-transparent px-4 py-2 text-[11px] font-black uppercase tracking-wider text-slate-300 transition hover:bg-white/5 hover:text-white">
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              {sharedId === achievement.id ? 'Copied / shared!' : 'Share'}
            </button>
          </article>
        ))}
      </div>

      {memberUid && mine.length > 0 && (
        <section aria-label="My submissions" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-amber-400">My submissions</h3>
          <ul className="mt-3 space-y-2">
            {mine.map(item => (
              <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-2.5 text-sm">
                <div className="min-w-0">
                  <span className="block truncate font-semibold text-slate-200">{item.title}</span>
                  {item.status === 'rejected' && item.reviewNote && (
                    <span className="block truncate text-[11px] text-rose-300/80">Note: {item.reviewNote}</span>
                  )}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${STATUS_BADGE[item.status]}`}>
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
