import { useEffect, useMemo, useState } from 'react';
import { Archive, CheckCircle2, PencilLine, Plus, Trash2, Users } from 'lucide-react';
import type { Course, CourseFormValues, Enrollment } from './courseTypes';
import { COURSE_CATEGORIES, EMPTY_COURSE_FORM } from './courseTypes';
import {
  courseFromForm,
  deleteCourse,
  saveCourse,
  setCourseStatus,
  subscribeAllCourses,
} from './courseRepository';
import { subscribeAllEnrollments } from './enrollmentRepository';

interface CourseAdminManagerProps {
  adminUid: string;
  onAddActivityLog?: (action: string, targetId: string, targetName: string, details: string) => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-500 focus:outline-none';
const labelClass = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5';

function formFromCourse(course: Course): CourseFormValues {
  return {
    title: course.title,
    category: course.category,
    description: course.description,
    imageUrl: course.imageUrl ?? '',
    type: course.type,
    priceInr: course.priceInr,
    durationWeeks: course.durationWeeks,
    level: course.level,
    language: course.language,
    trainerName: course.trainerName,
    startDate: course.startDate ?? '',
    endDate: course.endDate ?? '',
    syllabusText: course.syllabus.join('\n'),
    outcomesText: course.outcomes.join('\n'),
    certificateAvailable: course.certificateAvailable,
  };
}

export default function CourseAdminManager({ adminUid, onAddActivityLog }: CourseAdminManagerProps) {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [editing, setEditing] = useState<Course | 'new' | null>(null);
  const [form, setForm] = useState<CourseFormValues>(EMPTY_COURSE_FORM);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsubCourses = subscribeAllCourses(
      setCourses,
      () => setNotice({ kind: 'err', text: 'Courses could not be loaded.' }),
    );
    const unsubEnrollments = subscribeAllEnrollments(setEnrollments, () => undefined);
    return () => {
      unsubCourses();
      unsubEnrollments();
    };
  }, []);

  const enrollmentCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of enrollments) {
      if (item.status === 'cancelled') continue;
      counts.set(item.courseId, (counts.get(item.courseId) ?? 0) + 1);
    }
    return counts;
  }, [enrollments]);

  const startCreate = () => {
    setEditing('new');
    setForm(EMPTY_COURSE_FORM);
    setNotice(null);
  };

  const startEdit = (course: Course) => {
    setEditing(course);
    setForm(formFromCourse(course));
    setNotice(null);
  };

  const set = <K extends keyof CourseFormValues>(key: K, value: CourseFormValues[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setNotice({ kind: 'err', text: 'Title and description are required.' });
      return;
    }
    if (form.type === 'paid' && form.priceInr <= 0) {
      setNotice({ kind: 'err', text: 'Paid courses need a price above zero.' });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const course = courseFromForm(form, adminUid, editing === 'new' ? undefined : editing ?? undefined);
      await saveCourse(course);
      onAddActivityLog?.(
        editing === 'new' ? 'Course Created' : 'Course Updated',
        course.id,
        course.title,
        `${course.type === 'paid' ? `Paid (₹${course.priceInr})` : 'Free'} · ${course.category} · status ${course.status}.`,
      );
      setNotice({ kind: 'ok', text: `"${course.title}" saved.` });
      setEditing(null);
    } catch (error) {
      setNotice({
        kind: 'err',
        text: error instanceof Error ? error.message : 'Saving failed. Please try again.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleStatus = async (course: Course, status: Course['status']) => {
    setBusy(true);
    try {
      await setCourseStatus(course.id, status, adminUid);
      onAddActivityLog?.('Course Status Changed', course.id, course.title, `Status set to ${status}.`);
    } catch {
      setNotice({ kind: 'err', text: 'Status change failed.' });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (course: Course) => {
    setBusy(true);
    try {
      await deleteCourse(course.id);
      onAddActivityLog?.('Course Deleted', course.id, course.title, 'Course removed from the catalog.');
      setConfirmDeleteId(null);
    } catch {
      setNotice({ kind: 'err', text: 'Delete failed.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            CISCAF administration
          </p>
          <h2 className="text-xl font-black tracking-tight text-white">Course manager</h2>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-amber-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> New course
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

      {editing && (
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 p-5">
          <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-amber-300">
            {editing === 'new' ? 'Create course' : `Edit: ${editing.title}`}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="course-title">Course title *</label>
              <input id="course-title" className={inputClass} value={form.title}
                onChange={e => set('title', e.target.value)} maxLength={160} />
            </div>
            <div>
              <label className={labelClass} htmlFor="course-category">Category</label>
              <select id="course-category" className={inputClass} value={form.category}
                onChange={e => set('category', e.target.value as CourseFormValues['category'])}>
                {COURSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="course-trainer">Trainer name</label>
              <input id="course-trainer" className={inputClass} value={form.trainerName}
                onChange={e => set('trainerName', e.target.value)} maxLength={120} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="course-desc">Description *</label>
              <textarea id="course-desc" className={inputClass} rows={3} value={form.description}
                onChange={e => set('description', e.target.value)} maxLength={2000} />
            </div>
            <div>
              <label className={labelClass} htmlFor="course-type">Type</label>
              <select id="course-type" className={inputClass} value={form.type}
                onChange={e => set('type', e.target.value as CourseFormValues['type'])}>
                <option value="free">Free</option>
                <option value="paid">Paid (enrollment opens with payments)</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="course-price">Price (INR)</label>
              <input id="course-price" type="number" min={0} className={inputClass}
                value={form.priceInr} disabled={form.type === 'free'}
                onChange={e => set('priceInr', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass} htmlFor="course-duration">Duration (weeks)</label>
              <input id="course-duration" type="number" min={1} max={104} className={inputClass}
                value={form.durationWeeks}
                onChange={e => set('durationWeeks', Number(e.target.value))} />
            </div>
            <div>
              <label className={labelClass} htmlFor="course-level">Level</label>
              <select id="course-level" className={inputClass} value={form.level}
                onChange={e => set('level', e.target.value as CourseFormValues['level'])}>
                <option>All levels</option><option>Beginner</option>
                <option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="course-language">Language</label>
              <input id="course-language" className={inputClass} value={form.language}
                onChange={e => set('language', e.target.value)} maxLength={60} />
            </div>
            <div>
              <label className={labelClass} htmlFor="course-image">Image URL (Cloudinary)</label>
              <input id="course-image" className={inputClass} value={form.imageUrl}
                placeholder="https://res.cloudinary.com/…"
                onChange={e => set('imageUrl', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="course-start">Start date</label>
              <input id="course-start" type="date" className={inputClass} value={form.startDate}
                onChange={e => set('startDate', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="course-end">End date</label>
              <input id="course-end" type="date" className={inputClass} value={form.endDate}
                onChange={e => set('endDate', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="course-syllabus">Syllabus (one item per line)</label>
              <textarea id="course-syllabus" className={inputClass} rows={4} value={form.syllabusText}
                onChange={e => set('syllabusText', e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="course-outcomes">Learning outcomes (one per line)</label>
              <textarea id="course-outcomes" className={inputClass} rows={4} value={form.outcomesText}
                onChange={e => set('outcomesText', e.target.value)} />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input id="course-cert" type="checkbox" checked={form.certificateAvailable}
                onChange={e => set('certificateAvailable', e.target.checked)}
                className="h-4 w-4 accent-amber-500" />
              <label htmlFor="course-cert" className="text-sm text-slate-300">
                Certificate available on completion
              </label>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={handleSave} disabled={busy}
              className="cursor-pointer rounded-xl border-0 bg-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-400 disabled:opacity-60">
              {busy ? 'Saving…' : 'Save course'}
            </button>
            <button onClick={() => setEditing(null)} disabled={busy}
              className="cursor-pointer rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 transition hover:bg-white/5">
              Cancel
            </button>
          </div>
        </div>
      )}

      {courses === null ? (
        <div className="space-y-2" aria-hidden="true">
          {[0, 1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-10 text-center text-sm text-slate-400">
          No courses yet. Create the first CISCAF course to open the catalog.
        </div>
      ) : (
        <ul className="space-y-2">
          {courses.map(course => (
            <li key={course.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-bold text-white">{course.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                    course.status === 'published' ? 'bg-emerald-500/10 text-emerald-300'
                    : course.status === 'draft' ? 'bg-amber-500/10 text-amber-300'
                    : 'bg-slate-500/10 text-slate-400'
                  }`}>{course.status}</span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {course.type === 'paid' ? `₹${course.priceInr.toLocaleString('en-IN')}` : 'Free'}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-[11px] text-slate-500">
                  <span>{course.category}</span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" aria-hidden="true" />
                    {enrollmentCount.get(course.id) ?? 0} enrolled
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => startEdit(course)} title="Edit" aria-label={`Edit ${course.title}`}
                  className="cursor-pointer rounded-lg border-0 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white">
                  <PencilLine className="h-4 w-4" aria-hidden="true" />
                </button>
                {course.status !== 'published' ? (
                  <button onClick={() => handleStatus(course, 'published')} disabled={busy}
                    title="Publish" aria-label={`Publish ${course.title}`}
                    className="cursor-pointer rounded-lg border-0 bg-emerald-500/10 p-2 text-emerald-300 transition hover:bg-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button onClick={() => handleStatus(course, 'archived')} disabled={busy}
                    title="Archive" aria-label={`Archive ${course.title}`}
                    className="cursor-pointer rounded-lg border-0 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
                    <Archive className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
                {confirmDeleteId === course.id ? (
                  <button onClick={() => handleDelete(course)} disabled={busy}
                    className="cursor-pointer rounded-lg border-0 bg-rose-500/20 px-2.5 py-2 text-[10px] font-black uppercase text-rose-300 transition hover:bg-rose-500/30">
                    Confirm delete
                  </button>
                ) : (
                  <button onClick={() => setConfirmDeleteId(course.id)}
                    title="Delete" aria-label={`Delete ${course.title}`}
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
