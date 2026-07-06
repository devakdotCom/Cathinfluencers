import { useEffect, useMemo, useState } from 'react';
import { Archive, CheckCircle2, PencilLine, Plus, Trash2, XCircle } from 'lucide-react';
import type {
  MadhaTvParticipant,
  MadhaTvProgram,
  ProgramCategory,
  ProgramFormValues,
} from './madhaTvTypes';
import { EMPTY_PROGRAM_FORM, PROGRAM_CATEGORIES } from './madhaTvTypes';
import {
  deleteProgram,
  programFromForm,
  reviewParticipant,
  saveProgram,
  setProgramStatus,
  subscribeAllParticipants,
  subscribeAllPrograms,
} from './madhaTvRepository';

interface MadhaTvAdminManagerProps {
  adminUid: string;
  onAddActivityLog?: (action: string, targetId: string, targetName: string, details: string) => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-500 focus:outline-none';
const labelClass = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5';

function formFromProgram(program: MadhaTvProgram): ProgramFormValues {
  return {
    title: program.title,
    description: program.description,
    category: program.category,
    thumbnailUrl: program.thumbnailUrl ?? '',
    videoUrl: program.videoUrl ?? '',
    programDate: program.programDate ?? '',
    participationOpen: program.participationOpen,
  };
}

export default function MadhaTvAdminManager({ adminUid, onAddActivityLog }: MadhaTvAdminManagerProps) {
  const [programs, setPrograms] = useState<MadhaTvProgram[] | null>(null);
  const [participants, setParticipants] = useState<MadhaTvParticipant[]>([]);
  const [editing, setEditing] = useState<MadhaTvProgram | 'new' | null>(null);
  const [form, setForm] = useState<ProgramFormValues>(EMPTY_PROGRAM_FORM);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsubPrograms = subscribeAllPrograms(
      setPrograms,
      () => setNotice({ kind: 'err', text: 'Programs could not be loaded.' }),
    );
    const unsubParticipants = subscribeAllParticipants(setParticipants, () => undefined);
    return () => {
      unsubPrograms();
      unsubParticipants();
    };
  }, []);

  const pendingParticipants = useMemo(
    () => participants.filter(p => p.status === 'pending'),
    [participants],
  );

  const participantCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of participants) {
      if (p.status === 'rejected') continue;
      counts.set(p.programId, (counts.get(p.programId) ?? 0) + 1);
    }
    return counts;
  }, [participants]);

  const set = <K extends keyof ProgramFormValues>(key: K, value: ProgramFormValues[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const startCreate = () => {
    setEditing('new');
    setForm(EMPTY_PROGRAM_FORM);
    setNotice(null);
  };

  const startEdit = (program: MadhaTvProgram) => {
    setEditing(program);
    setForm(formFromProgram(program));
    setNotice(null);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setNotice({ kind: 'err', text: 'Title and description are required.' });
      return;
    }
    setBusy(true);
    try {
      const program = programFromForm(form, adminUid, editing === 'new' ? undefined : editing ?? undefined);
      await saveProgram(program);
      onAddActivityLog?.(
        editing === 'new' ? 'Madha TV Program Created' : 'Madha TV Program Updated',
        program.id, program.title, `${program.category} · status ${program.status}.`);
      setNotice({ kind: 'ok', text: `"${program.title}" saved.` });
      setEditing(null);
    } catch {
      setNotice({ kind: 'err', text: 'Saving failed. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const handleStatus = async (program: MadhaTvProgram, status: MadhaTvProgram['status']) => {
    setBusy(true);
    try {
      await setProgramStatus(program.id, status, adminUid);
      onAddActivityLog?.('Madha TV Program Status Changed', program.id, program.title, `Status set to ${status}.`);
    } catch {
      setNotice({ kind: 'err', text: 'Status change failed.' });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (program: MadhaTvProgram) => {
    setBusy(true);
    try {
      await deleteProgram(program.id);
      onAddActivityLog?.('Madha TV Program Deleted', program.id, program.title, 'Removed permanently.');
      setConfirmDeleteId(null);
    } catch {
      setNotice({ kind: 'err', text: 'Delete failed.' });
    } finally {
      setBusy(false);
    }
  };

  const handleReview = async (participant: MadhaTvParticipant, status: 'approved' | 'rejected') => {
    setBusy(true);
    try {
      await reviewParticipant(participant.id, status);
      onAddActivityLog?.(
        status === 'approved' ? 'Madha TV Participant Approved' : 'Madha TV Participant Rejected',
        participant.programId, participant.programTitle,
        `${participant.memberName} ${status}.`);
    } catch {
      setNotice({ kind: 'err', text: 'Review action failed.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Madha TV administration
          </p>
          <h2 className="text-xl font-black tracking-tight text-white">Programs &amp; participants</h2>
        </div>
        <button onClick={startCreate}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-amber-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-400">
          <Plus className="h-4 w-4" aria-hidden="true" /> New program
        </button>
      </div>

      {notice && (
        <div role="status" className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
          notice.kind === 'ok'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
        }`}>
          {notice.text}
        </div>
      )}

      {editing && (
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 p-5">
          <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-amber-300">
            {editing === 'new' ? 'Create program' : `Edit: ${editing.title}`}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="prog-title">Program title *</label>
              <input id="prog-title" className={inputClass} value={form.title} maxLength={160}
                onChange={e => set('title', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="prog-desc">Description *</label>
              <textarea id="prog-desc" className={inputClass} rows={3} value={form.description}
                maxLength={2000} onChange={e => set('description', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="prog-category">Category</label>
              <select id="prog-category" className={inputClass} value={form.category}
                onChange={e => set('category', e.target.value as ProgramCategory)}>
                {PROGRAM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="prog-date">Program date</label>
              <input id="prog-date" type="date" className={inputClass} value={form.programDate}
                onChange={e => set('programDate', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="prog-thumb">Thumbnail URL (Cloudinary)</label>
              <input id="prog-thumb" className={inputClass} value={form.thumbnailUrl}
                placeholder="https://res.cloudinary.com/…" onChange={e => set('thumbnailUrl', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="prog-video">YouTube / video link</label>
              <input id="prog-video" className={inputClass} value={form.videoUrl}
                placeholder="https://youtube.com/…" onChange={e => set('videoUrl', e.target.value)} />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input id="prog-open" type="checkbox" checked={form.participationOpen}
                onChange={e => set('participationOpen', e.target.checked)} className="h-4 w-4 accent-amber-500" />
              <label htmlFor="prog-open" className="text-sm text-slate-300">
                Participation registration open
              </label>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={handleSave} disabled={busy}
              className="cursor-pointer rounded-xl border-0 bg-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-400 disabled:opacity-60">
              {busy ? 'Saving…' : 'Save program'}
            </button>
            <button onClick={() => setEditing(null)} disabled={busy}
              className="cursor-pointer rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 transition hover:bg-white/5">
              Cancel
            </button>
          </div>
        </div>
      )}

      {pendingParticipants.length > 0 && (
        <section aria-label="Pending participants" className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-4">
          <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-amber-300">
            Pending participants ({pendingParticipants.length})
          </h3>
          <ul className="space-y-2">
            {pendingParticipants.map(participant => (
              <li key={participant.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-2.5">
                <div className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-200">
                    {participant.memberName}
                  </span>
                  <span className="text-[11px] text-slate-500">{participant.programTitle}</span>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button onClick={() => handleReview(participant, 'approved')} disabled={busy}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Approve
                  </button>
                  <button onClick={() => handleReview(participant, 'rejected')} disabled={busy}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-rose-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-rose-300 transition hover:bg-rose-500/20">
                    <XCircle className="h-3.5 w-3.5" aria-hidden="true" /> Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {programs === null ? (
        <div className="space-y-2" aria-hidden="true">
          {[0, 1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      ) : programs.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-10 text-center text-sm text-slate-400">
          No programs yet. Create the first Madha TV program.
        </div>
      ) : (
        <ul className="space-y-2">
          {programs.map(program => (
            <li key={program.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-bold text-white">{program.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                    program.status === 'published' ? 'bg-emerald-500/10 text-emerald-300'
                    : program.status === 'draft' ? 'bg-amber-500/10 text-amber-300'
                    : 'bg-slate-500/10 text-slate-400'
                  }`}>{program.status}</span>
                  {!program.participationOpen && (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Registration closed
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {program.category} · {participantCount.get(program.id) ?? 0} participant(s)
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => startEdit(program)} title="Edit" aria-label={`Edit ${program.title}`}
                  className="cursor-pointer rounded-lg border-0 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white">
                  <PencilLine className="h-4 w-4" aria-hidden="true" />
                </button>
                {program.status !== 'published' ? (
                  <button onClick={() => handleStatus(program, 'published')} disabled={busy}
                    title="Publish" aria-label={`Publish ${program.title}`}
                    className="cursor-pointer rounded-lg border-0 bg-emerald-500/10 p-2 text-emerald-300 transition hover:bg-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button onClick={() => handleStatus(program, 'archived')} disabled={busy}
                    title="Archive" aria-label={`Archive ${program.title}`}
                    className="cursor-pointer rounded-lg border-0 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
                    <Archive className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
                {confirmDeleteId === program.id ? (
                  <button onClick={() => handleDelete(program)} disabled={busy}
                    className="cursor-pointer rounded-lg border-0 bg-rose-500/20 px-2.5 py-2 text-[10px] font-black uppercase text-rose-300 transition hover:bg-rose-500/30">
                    Confirm delete
                  </button>
                ) : (
                  <button onClick={() => setConfirmDeleteId(program.id)}
                    title="Delete" aria-label={`Delete ${program.title}`}
                    className="cursor-pointer rounded-lg border-0 bg-white/5 p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
