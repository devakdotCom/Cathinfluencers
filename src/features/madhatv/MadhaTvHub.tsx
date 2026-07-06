import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ExternalLink, PlaySquare, Tv } from 'lucide-react';
import type { MadhaTvParticipant, MadhaTvProgram, ProgramCategory } from './madhaTvTypes';
import { PROGRAM_CATEGORIES } from './madhaTvTypes';
import {
  registerParticipant,
  subscribeMyParticipations,
  subscribePublishedPrograms,
} from './madhaTvRepository';

interface MadhaTvHubProps {
  memberUid?: string;
  memberName?: string;
  onRequireSignIn: () => void;
  onAddActivityLog?: (action: string, targetId: string, targetName: string, details: string) => void;
}

const STATUS_BADGE: Record<MadhaTvParticipant['status'], string> = {
  pending: 'bg-amber-500/10 text-amber-300',
  approved: 'bg-emerald-500/10 text-emerald-300',
  rejected: 'bg-rose-500/10 text-rose-300',
};

export default function MadhaTvHub({
  memberUid,
  memberName,
  onRequireSignIn,
  onAddActivityLog,
}: MadhaTvHubProps) {
  const [programs, setPrograms] = useState<MadhaTvProgram[] | null>(null);
  const [mine, setMine] = useState<MadhaTvParticipant[]>([]);
  const [category, setCategory] = useState<'all' | ProgramCategory>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    return subscribePublishedPrograms(
      setPrograms,
      () => setNotice({ kind: 'err', text: 'Programs could not be loaded right now.' }),
    );
  }, []);

  useEffect(() => {
    if (!memberUid) {
      setMine([]);
      return;
    }
    return subscribeMyParticipations(memberUid, setMine, () => undefined);
  }, [memberUid]);

  const myByProgram = useMemo(
    () => new Map(mine.map(p => [p.programId, p])),
    [mine],
  );

  const visible = useMemo(
    () => (programs ?? []).filter(p => category === 'all' || p.category === category),
    [programs, category],
  );

  const presentCategories = useMemo(() => {
    const present = new Set((programs ?? []).map(p => p.category));
    return PROGRAM_CATEGORIES.filter(c => present.has(c));
  }, [programs]);

  const handleRegister = async (program: MadhaTvProgram) => {
    if (!memberUid) {
      onRequireSignIn();
      return;
    }
    setBusyId(program.id);
    setNotice(null);
    try {
      await registerParticipant(program, memberUid, memberName ?? 'Member');
      onAddActivityLog?.('Madha TV Registration', program.id, program.title,
        'Registered to participate; awaiting approval.');
      setNotice({ kind: 'ok', text: `Registered for "${program.title}". The team will review your participation.` });
    } catch (error) {
      setNotice({
        kind: 'err',
        text: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Madha TV · Catholic media in motion
        </p>
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Watch, participate, and appear
        </h2>
        <p className="mt-1 text-sm text-slate-400 max-w-2xl">
          Shows, talks, live worship, and real participation opportunities for young creators.
          Register for open programs and the team will confirm your spot.
        </p>
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

      {presentCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Program categories">
          {(['all', ...presentCategories] as const).map(item => (
            <button key={item} role="tab" aria-selected={category === item}
              onClick={() => setCategory(item as 'all' | ProgramCategory)}
              className={`shrink-0 px-3 py-1.5 rounded-xl border-0 text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
                category === item ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}>
              {item === 'all' ? 'All' : item}
            </button>
          ))}
        </div>
      )}

      {programs === null && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
          {[0, 1, 2].map(i => <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      )}

      {programs !== null && visible.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center">
          <Tv className="mx-auto mb-3 h-8 w-8 text-slate-500" aria-hidden="true" />
          <p className="text-sm font-bold text-slate-300">No programs published yet</p>
          <p className="mt-1 text-xs text-slate-500">
            New shows, talks, and participation calls will appear here.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map(program => {
          const participation = myByProgram.get(program.id);
          const busy = busyId === program.id;
          return (
            <article key={program.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition hover:border-amber-500/40">
              {program.thumbnailUrl ? (
                <img src={program.thumbnailUrl} alt="" loading="lazy" className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950" aria-hidden="true">
                  <PlaySquare className="h-10 w-10 text-amber-400/60" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300">
                    {program.category}
                  </span>
                  {program.programDate && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <CalendarDays className="h-3 w-3" aria-hidden="true" />
                      {new Date(program.programDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black tracking-tight text-white">{program.title}</h3>
                <p className="mt-1.5 line-clamp-3 flex-1 text-[13px] leading-relaxed text-slate-400">
                  {program.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {program.videoUrl && (
                    <a href={program.videoUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-slate-300 transition hover:bg-white/5 hover:text-white">
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Watch
                    </a>
                  )}
                  {participation ? (
                    <span className={`rounded-xl px-3.5 py-2 text-[11px] font-black uppercase tracking-wider ${STATUS_BADGE[participation.status]}`}>
                      {participation.status === 'pending' ? 'Registration pending'
                        : participation.status === 'approved' ? 'You are in!'
                        : 'Not selected'}
                    </span>
                  ) : program.participationOpen ? (
                    <button onClick={() => handleRegister(program)} disabled={busy}
                      className="cursor-pointer rounded-xl border-0 bg-amber-500 px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-400 disabled:opacity-60">
                      {busy ? 'Registering…' : memberUid ? 'Register to participate' : 'Sign in to register'}
                    </button>
                  ) : (
                    <span className="rounded-xl bg-white/5 px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-slate-500">
                      Registration closed
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
