import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ExternalLink, UserX, XCircle } from 'lucide-react';
import type { Course } from '../courses/courseTypes';
import { assignTrainerToCourse, subscribeAllCourses } from '../courses/courseRepository';
import type { Trainer, TrainerApplication } from './trainerTypes';
import {
  approveTrainer,
  rejectTrainer,
  setTrainerActive,
  subscribeAllApplications,
  subscribeAllTrainers,
} from './trainerRepository';

interface TrainerAdminManagerProps {
  adminUid: string;
  onAddActivityLog?: (action: string, targetId: string, targetName: string, details: string) => void;
}

export default function TrainerAdminManager({ adminUid, onAddActivityLog }: TrainerAdminManagerProps) {
  const [applications, setApplications] = useState<TrainerApplication[] | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [assignCourseId, setAssignCourseId] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubApps = subscribeAllApplications(
      setApplications,
      () => setError('Trainer applications could not be loaded.'),
    );
    const unsubTrainers = subscribeAllTrainers(setTrainers, () => undefined);
    const unsubCourses = subscribeAllCourses(setCourses, () => undefined);
    return () => {
      unsubApps();
      unsubTrainers();
      unsubCourses();
    };
  }, []);

  const pending = useMemo(
    () => (applications ?? []).filter(a => a.status === 'pending'),
    [applications],
  );

  const coursesByTrainer = useMemo(() => {
    const map = new Map<string, Course[]>();
    for (const course of courses) {
      if (!course.trainerUid) continue;
      const list = map.get(course.trainerUid) ?? [];
      list.push(course);
      map.set(course.trainerUid, list);
    }
    return map;
  }, [courses]);

  const handleApprove = async (application: TrainerApplication) => {
    setBusyId(application.id);
    setError(null);
    try {
      await approveTrainer(application, adminUid);
      onAddActivityLog?.('Trainer Approved', application.id, application.fullName,
        'Application approved; public trainer profile created.');
    } catch {
      setError('Approval failed. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (application: TrainerApplication) => {
    setBusyId(application.id);
    try {
      await rejectTrainer(application.id, adminUid, note.trim() || undefined);
      onAddActivityLog?.('Trainer Rejected', application.id, application.fullName,
        note.trim() ? `Rejected with note: ${note.trim()}` : 'Rejected.');
      setNoteFor(null);
      setNote('');
    } catch {
      setError('Rejection failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (trainer: Trainer) => {
    setBusyId(trainer.id);
    try {
      await setTrainerActive(trainer.id, !trainer.active);
      onAddActivityLog?.('Trainer Status Changed', trainer.id, trainer.fullName,
        trainer.active ? 'Deactivated.' : 'Reactivated.');
    } catch {
      setError('Status change failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleAssign = async (trainer: Trainer) => {
    const courseId = assignCourseId[trainer.id];
    if (!courseId) return;
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    setBusyId(trainer.id);
    try {
      await assignTrainerToCourse(course.id, trainer.id, trainer.fullName, adminUid);
      onAddActivityLog?.('Course Assigned to Trainer', course.id, course.title,
        `Assigned to trainer ${trainer.fullName}.`);
      setAssignCourseId(prev => ({ ...prev, [trainer.id]: '' }));
    } catch {
      setError('Assignment failed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Trainer administration
        </p>
        <h2 className="text-xl font-black tracking-tight text-white">Applications &amp; trainers</h2>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <section aria-label="Pending applications" className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-widest text-amber-400">
          Pending applications {pending.length > 0 && `(${pending.length})`}
        </h3>
        {applications === null ? (
          <div className="space-y-2" aria-hidden="true">
            {[0, 1].map(i => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : pending.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-8 text-center text-sm text-slate-400">
            Application queue is clear.
          </div>
        ) : (
          <ul className="space-y-3">
            {pending.map(application => {
              const busy = busyId === application.id;
              return (
                <li key={application.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white">{application.fullName}</p>
                      <p className="text-[11px] text-slate-500">
                        {application.qualification} · {application.email}
                        {application.mobile ? ` · ${application.mobile}` : ''}
                      </p>
                      <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{application.bio}</p>
                      {application.teachingExperience && (
                        <p className="mt-1 text-[12px] text-slate-500">
                          Experience: {application.teachingExperience}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {application.courseTopics.map(topic => (
                          <span key={topic} className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {topic}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
                        {application.sampleVideoUrl && (
                          <a href={application.sampleVideoUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sky-300 hover:underline">
                            <ExternalLink className="h-3 w-3" aria-hidden="true" /> Sample video
                          </a>
                        )}
                        {application.profileImageUrl && (
                          <a href={application.profileImageUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sky-300 hover:underline">
                            <ExternalLink className="h-3 w-3" aria-hidden="true" /> Profile photo
                          </a>
                        )}
                        <span className="text-slate-500">
                          Preference: {application.preference} · Availability: {application.availability || 'not stated'}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button onClick={() => handleApprove(application)} disabled={busy}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-emerald-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Approve
                      </button>
                      <button onClick={() => { setNoteFor(noteFor === application.id ? null : application.id); setNote(''); }} disabled={busy}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-rose-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-rose-300 transition hover:bg-rose-500/20">
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" /> Reject
                      </button>
                    </div>
                  </div>
                  {noteFor === application.id && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <input value={note} onChange={e => setNote(e.target.value)} maxLength={500}
                        placeholder="Reason / guidance for the applicant"
                        className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-500 focus:outline-none" />
                      <button onClick={() => handleReject(application)} disabled={busyId === application.id}
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
      </section>

      <section aria-label="Approved trainers" className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-widest text-amber-400">
          Trainers ({trainers.length})
        </h3>
        {trainers.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-8 text-center text-sm text-slate-400">
            No approved trainers yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {trainers.map(trainer => {
              const busy = busyId === trainer.id;
              const assigned = coursesByTrainer.get(trainer.id) ?? [];
              const assignable = courses.filter(c => c.trainerUid !== trainer.id);
              return (
                <li key={trainer.id} className={`rounded-xl border p-4 ${trainer.active ? 'border-slate-800 bg-slate-900/60' : 'border-slate-800 bg-slate-950/60 opacity-70'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">{trainer.fullName}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                          trainer.active ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          {trainer.active ? 'Active' : 'Deactivated'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{trainer.qualification} · {trainer.preference}</p>
                    </div>
                    <button onClick={() => handleToggleActive(trainer)} disabled={busy}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-300 transition hover:bg-white/10">
                      <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                      {trainer.active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </div>

                  {assigned.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {assigned.map(course => (
                        <span key={course.id} className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          <BookOpen className="h-3 w-3" aria-hidden="true" /> {course.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {trainer.active && assignable.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <select
                        value={assignCourseId[trainer.id] ?? ''}
                        onChange={e => setAssignCourseId(prev => ({ ...prev, [trainer.id]: e.target.value }))}
                        aria-label={`Assign a course to ${trainer.fullName}`}
                        className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none">
                        <option value="">Assign a course…</option>
                        {assignable.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.title} ({course.status})
                          </option>
                        ))}
                      </select>
                      <button onClick={() => handleAssign(trainer)}
                        disabled={busy || !assignCourseId[trainer.id]}
                        className="cursor-pointer rounded-xl border-0 bg-amber-500 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-400 disabled:opacity-50">
                        Assign
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
