import { useEffect, useMemo, useState } from 'react';
import { Award, BookOpen, Clock, GraduationCap, Languages, User } from 'lucide-react';
import type { Course, CourseCategory, Enrollment } from './courseTypes';
import { COURSE_CATEGORIES } from './courseTypes';
import { subscribePublishedCourses } from './courseRepository';
import { enrollInFreeCourse, subscribeMyEnrollments } from './enrollmentRepository';

interface CourseCatalogProps {
  memberUid?: string;
  memberName?: string;
  onRequireSignIn: () => void;
  onAddActivityLog?: (action: string, targetId: string, targetName: string, details: string) => void;
}

export default function CourseCatalog({
  memberUid,
  memberName,
  onRequireSignIn,
  onAddActivityLog,
}: CourseCatalogProps) {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  const [category, setCategory] = useState<'all' | CourseCategory>('all');
  const [busyCourseId, setBusyCourseId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribePublishedCourses(
      setCourses,
      () => setLoadError('Courses could not be loaded. Please try again later.'),
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!memberUid) {
      setMyEnrollments([]);
      return;
    }
    const unsubscribe = subscribeMyEnrollments(memberUid, setMyEnrollments, () => undefined);
    return unsubscribe;
  }, [memberUid]);

  const enrolledCourseIds = useMemo(
    () => new Set(myEnrollments.filter(e => e.status !== 'cancelled').map(e => e.courseId)),
    [myEnrollments],
  );

  const visibleCourses = useMemo(
    () => (courses ?? []).filter(c => category === 'all' || c.category === category),
    [courses, category],
  );

  const availableCategories = useMemo(() => {
    const present = new Set((courses ?? []).map(c => c.category));
    return COURSE_CATEGORIES.filter(c => present.has(c));
  }, [courses]);

  const handleEnroll = async (course: Course) => {
    if (!memberUid) {
      onRequireSignIn();
      return;
    }
    if (course.type === 'paid') {
      setNotice({
        kind: 'err',
        text: 'Online payment is opening soon. Paid course enrollment will be available shortly.',
      });
      return;
    }
    setBusyCourseId(course.id);
    setNotice(null);
    try {
      await enrollInFreeCourse(course, memberUid, memberName ?? 'Member');
      setNotice({ kind: 'ok', text: `Enrolled in "${course.title}". It now appears under My Courses.` });
      onAddActivityLog?.('Course Enrollment', course.id, course.title, 'Enrolled in free CISCAF course.');
    } catch (error) {
      setNotice({
        kind: 'err',
        text: error instanceof Error ? error.message : 'Enrollment failed. Please try again.',
      });
    } finally {
      setBusyCourseId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          CISCAF · Courses &amp; Formation
        </p>
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Faith and media formation tracks
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl">
          Disciples first, influencers second. Enroll in free courses instantly; paid courses open
          for enrollment when online payment launches.
        </p>
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

      {availableCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Course categories">
          <button
            onClick={() => setCategory('all')}
            role="tab"
            aria-selected={category === 'all'}
            className={`shrink-0 px-3 py-1.5 rounded-xl border-0 text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
              category === 'all'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          {availableCategories.map(item => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              role="tab"
              aria-selected={category === item}
              className={`shrink-0 px-3 py-1.5 rounded-xl border-0 text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
                category === item
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {loadError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {loadError}
        </div>
      )}

      {courses === null && !loadError && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {courses !== null && visibleCourses.length === 0 && !loadError && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center">
          <GraduationCap className="mx-auto mb-3 h-8 w-8 text-slate-500" aria-hidden="true" />
          <p className="text-sm font-bold text-slate-300">No courses published yet</p>
          <p className="mt-1 text-xs text-slate-500">
            New CISCAF tracks are announced here as soon as the commission publishes them.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleCourses.map(course => {
          const enrolled = enrolledCourseIds.has(course.id);
          const busy = busyCourseId === course.id;
          return (
            <article
              key={course.id}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-amber-500/40 hover:bg-slate-900"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300">
                  {course.category}
                </span>
                {course.type === 'free' ? (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                    Free
                  </span>
                ) : (
                  <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-sky-300">
                    ₹{course.priceInr.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {course.imageUrl && (
                <img
                  src={course.imageUrl}
                  alt=""
                  loading="lazy"
                  className="mb-3 h-36 w-full rounded-xl object-cover"
                />
              )}

              <h3 className="text-lg font-black tracking-tight text-white">{course.title}</h3>
              <p className="mt-1.5 line-clamp-3 flex-1 text-[13px] leading-relaxed text-slate-400">
                {course.description}
              </p>

              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                  <dt className="sr-only">Duration</dt>
                  <dd>{course.durationWeeks} week{course.durationWeeks === 1 ? '' : 's'}</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                  <dt className="sr-only">Level</dt>
                  <dd>{course.level}</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <Languages className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                  <dt className="sr-only">Language</dt>
                  <dd>{course.language}</dd>
                </div>
                {course.trainerName && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                    <dt className="sr-only">Trainer</dt>
                    <dd className="truncate">{course.trainerName}</dd>
                  </div>
                )}
                {course.certificateAvailable && (
                  <div className="flex items-center gap-1.5 text-amber-300/90">
                    <Award className="h-3.5 w-3.5" aria-hidden="true" />
                    <dd>Certificate</dd>
                  </div>
                )}
              </dl>

              <div className="mt-4">
                {enrolled ? (
                  <span className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-300">
                    Enrolled
                  </span>
                ) : (
                  <button
                    onClick={() => handleEnroll(course)}
                    disabled={busy}
                    className="w-full cursor-pointer rounded-xl border-0 bg-amber-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60"
                  >
                    {busy
                      ? 'Enrolling…'
                      : course.type === 'free'
                        ? memberUid ? 'Enroll now' : 'Sign in to enroll'
                        : 'Payments opening soon'}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {memberUid && myEnrollments.length > 0 && (
        <section aria-label="My courses" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-amber-400">My courses</h3>
          <ul className="mt-3 space-y-2">
            {myEnrollments.map(enrollment => (
              <li
                key={enrollment.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-2.5 text-sm"
              >
                <span className="font-semibold text-slate-200">{enrollment.courseTitle}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                    enrollment.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : enrollment.status === 'completed'
                        ? 'bg-amber-500/10 text-amber-300'
                        : 'bg-slate-500/10 text-slate-400'
                  }`}
                >
                  {enrollment.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
