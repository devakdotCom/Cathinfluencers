import { useEffect, useMemo, useState } from 'react';
import { BookOpen, ExternalLink, GraduationCap, Send, Users } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Course, Enrollment } from '../courses/courseTypes';
import type {
  Trainer,
  TrainerApplication,
  TrainerApplicationFormValues,
  TrainerPreference,
} from './trainerTypes';
import { EMPTY_TRAINER_FORM } from './trainerTypes';
import {
  submitTrainerApplication,
  subscribeActiveTrainers,
  subscribeMyApplication,
} from './trainerRepository';

interface TrainersHubProps {
  memberUid?: string;
  memberName?: string;
  memberEmail?: string;
  onRequireSignIn: () => void;
  onAddActivityLog?: (action: string, targetId: string, targetName: string, details: string) => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-500 focus:outline-none';
const labelClass = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5';

const STATUS_BADGE: Record<TrainerApplication['status'], string> = {
  pending: 'bg-amber-500/10 text-amber-300',
  approved: 'bg-emerald-500/10 text-emerald-300',
  rejected: 'bg-rose-500/10 text-rose-300',
};

export default function TrainersHub({
  memberUid,
  memberName,
  memberEmail,
  onRequireSignIn,
  onAddActivityLog,
}: TrainersHubProps) {
  const [trainers, setTrainers] = useState<Trainer[] | null>(null);
  const [myApplication, setMyApplication] = useState<TrainerApplication | null>(null);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [myStudents, setMyStudents] = useState<Enrollment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TrainerApplicationFormValues>(EMPTY_TRAINER_FORM);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    return subscribeActiveTrainers(
      setTrainers,
      () => setNotice({ kind: 'err', text: 'Trainer directory could not be loaded right now.' }),
    );
  }, []);

  useEffect(() => {
    if (!memberUid) {
      setMyApplication(null);
      return;
    }
    return subscribeMyApplication(memberUid, setMyApplication, () => undefined);
  }, [memberUid]);

  const isApprovedTrainer = myApplication?.status === 'approved';

  // Trainer dashboard data: my published courses and their enrollments.
  useEffect(() => {
    if (!db || !memberUid || !isApprovedTrainer) {
      setMyCourses([]);
      return;
    }
    return onSnapshot(
      query(
        collection(db, 'courses'),
        where('status', '==', 'published'),
        where('trainerUid', '==', memberUid),
      ),
      snapshot => setMyCourses(snapshot.docs.map(item => item.data() as Course)),
      () => undefined,
    );
  }, [memberUid, isApprovedTrainer]);

  useEffect(() => {
    if (!db || !memberUid || myCourses.length === 0) {
      setMyStudents([]);
      return;
    }
    const courseIds = myCourses.map(c => c.id).slice(0, 10);
    return onSnapshot(
      query(collection(db, 'enrollments'), where('courseId', 'in', courseIds)),
      snapshot => setMyStudents(snapshot.docs.map(item => item.data() as Enrollment)),
      () => undefined,
    );
  }, [memberUid, myCourses]);

  const studentsByCourse = useMemo(() => {
    const map = new Map<string, Enrollment[]>();
    for (const enrollment of myStudents) {
      if (enrollment.status === 'cancelled') continue;
      const list = map.get(enrollment.courseId) ?? [];
      list.push(enrollment);
      map.set(enrollment.courseId, list);
    }
    return map;
  }, [myStudents]);

  const set = <K extends keyof TrainerApplicationFormValues>(
    key: K,
    value: TrainerApplicationFormValues[K],
  ) => setForm(prev => ({ ...prev, [key]: value }));

  const openForm = () => {
    if (!memberUid) {
      onRequireSignIn();
      return;
    }
    setForm({
      ...EMPTY_TRAINER_FORM,
      fullName: myApplication?.fullName ?? memberName ?? '',
      email: myApplication?.email ?? memberEmail ?? '',
    });
    setShowForm(true);
    setNotice(null);
  };

  const handleSubmit = async () => {
    if (!memberUid) return;
    if (!form.fullName.trim() || !form.email.trim() || !form.bio.trim() || !form.qualification.trim()) {
      setNotice({ kind: 'err', text: 'Name, email, qualification, and bio are required.' });
      return;
    }
    setBusy(true);
    try {
      const application = await submitTrainerApplication(form, memberUid);
      onAddActivityLog?.('Trainer Application Submitted', application.id, application.fullName,
        'Application entered the review queue.');
      setNotice({ kind: 'ok', text: 'Application submitted. The commission will review it and respond.' });
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

  const preferenceLabel: Record<TrainerPreference, string> = {
    free: 'Volunteer trainer',
    paid: 'Paid trainer',
    both: 'Volunteer or paid',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Trainers &amp; mentors
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Teach what you have mastered
          </h2>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Priests, religious, and lay experts form the next generation of Catholic communicators.
            Every trainer is reviewed and approved by the commission.
          </p>
        </div>
        {!isApprovedTrainer && (
          <button onClick={openForm}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-amber-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-400">
            <Send className="h-4 w-4" aria-hidden="true" />
            {memberUid ? 'Apply as a trainer' : 'Sign in to apply'}
          </button>
        )}
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

      {myApplication && !isApprovedTrainer && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-slate-200">My trainer application</p>
            {myApplication.status === 'rejected' && myApplication.reviewNote && (
              <p className="mt-0.5 text-[12px] text-rose-300/80">Note: {myApplication.reviewNote}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${STATUS_BADGE[myApplication.status]}`}>
              {myApplication.status}
            </span>
            {myApplication.status === 'rejected' && (
              <button onClick={openForm}
                className="cursor-pointer rounded-xl border border-slate-700 bg-transparent px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-300 transition hover:bg-white/5">
                Reapply
              </button>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 p-5">
          <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-amber-300">
            Trainer application
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="tr-name">Full name *</label>
              <input id="tr-name" className={inputClass} value={form.fullName} maxLength={200}
                onChange={e => set('fullName', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="tr-email">Email *</label>
              <input id="tr-email" type="email" className={inputClass} value={form.email} maxLength={200}
                onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="tr-mobile">Mobile</label>
              <input id="tr-mobile" type="tel" className={inputClass} value={form.mobile} maxLength={20}
                onChange={e => set('mobile', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="tr-qual">Qualification *</label>
              <input id="tr-qual" className={inputClass} value={form.qualification} maxLength={200}
                onChange={e => set('qualification', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="tr-skills">Skills (comma separated)</label>
              <input id="tr-skills" className={inputClass} value={form.skillsText}
                placeholder="Video editing, Apologetics, Public speaking"
                onChange={e => set('skillsText', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="tr-topics">Course topics you can teach</label>
              <input id="tr-topics" className={inputClass} value={form.courseTopicsText}
                placeholder="Catechism, Podcasting, Youth ministry"
                onChange={e => set('courseTopicsText', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="tr-exp">Teaching experience</label>
              <textarea id="tr-exp" className={inputClass} rows={2} value={form.teachingExperience}
                maxLength={1000} onChange={e => set('teachingExperience', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="tr-bio">Bio *</label>
              <textarea id="tr-bio" className={inputClass} rows={3} value={form.bio} maxLength={1200}
                onChange={e => set('bio', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="tr-image">Profile image URL (Cloudinary)</label>
              <input id="tr-image" className={inputClass} value={form.profileImageUrl}
                placeholder="https://res.cloudinary.com/…"
                onChange={e => set('profileImageUrl', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="tr-video">Sample video link</label>
              <input id="tr-video" className={inputClass} value={form.sampleVideoUrl}
                placeholder="https://youtube.com/…"
                onChange={e => set('sampleVideoUrl', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="tr-pref">Trainer preference</label>
              <select id="tr-pref" className={inputClass} value={form.preference}
                onChange={e => set('preference', e.target.value as TrainerPreference)}>
                <option value="both">Volunteer or paid</option>
                <option value="free">Volunteer (free)</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="tr-avail">Availability</label>
              <input id="tr-avail" className={inputClass} value={form.availability} maxLength={200}
                placeholder="Weekends, weekday evenings…"
                onChange={e => set('availability', e.target.value)} />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={handleSubmit} disabled={busy}
              className="cursor-pointer rounded-xl border-0 bg-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-400 disabled:opacity-60">
              {busy ? 'Submitting…' : 'Submit application'}
            </button>
            <button onClick={() => setShowForm(false)} disabled={busy}
              className="cursor-pointer rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 transition hover:bg-white/5">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isApprovedTrainer && (
        <section aria-label="Trainer dashboard" className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-slate-950 p-5">
          <h3 className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-amber-300">
            <GraduationCap className="h-4 w-4" aria-hidden="true" /> My trainer dashboard
          </h3>
          {myCourses.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">
              No courses assigned yet. The commission assigns courses to trainers from the course manager.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {myCourses.map(course => {
                const students = studentsByCourse.get(course.id) ?? [];
                return (
                  <div key={course.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white">
                        <BookOpen className="h-4 w-4 text-amber-400" aria-hidden="true" />
                        {course.title}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" /> {students.length}
                      </span>
                    </div>
                    {students.length > 0 && (
                      <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto pr-1">
                        {students.map(enrollment => (
                          <li key={enrollment.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-[12px]">
                            <span className="truncate text-slate-200">{enrollment.memberName}</span>
                            <span className="shrink-0 text-slate-500">
                              {new Date(enrollment.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      <section aria-label="Trainer directory" className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-widest text-amber-400">Our trainers</h3>
        {trainers === null ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map(i => <div key={i} className="h-44 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : trainers.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-10 text-center text-sm text-slate-400">
            Approved trainers will appear here. Be the first to apply.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {trainers.map(trainer => (
              <article key={trainer.id}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-amber-500/40">
                <div className="flex items-center gap-3">
                  {trainer.profileImageUrl ? (
                    <img src={trainer.profileImageUrl} alt="" loading="lazy"
                      className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-base font-black text-slate-950" aria-hidden="true">
                      {trainer.fullName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="truncate text-base font-black tracking-tight text-white">{trainer.fullName}</h4>
                    <p className="truncate text-[12px] text-amber-200/90">{trainer.qualification}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 flex-1 text-[13px] leading-relaxed text-slate-400">{trainer.bio}</p>
                {trainer.courseTopics.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {trainer.courseTopics.slice(0, 4).map(topic => (
                      <span key={topic} className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {preferenceLabel[trainer.preference]}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      {myApplication?.sampleVideoUrl && myApplication.status === 'pending' && (
        <p className="text-[11px] text-slate-500">
          Your sample video:&nbsp;
          <a href={myApplication.sampleVideoUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sky-300 hover:underline">
            <ExternalLink className="h-3 w-3" aria-hidden="true" /> view link
          </a>
        </p>
      )}
    </div>
  );
}
