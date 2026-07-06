import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../firebase';
import type { Course, CourseFormValues, CourseStatus } from './courseTypes';

function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, 40);
}

export function courseFromForm(
  values: CourseFormValues,
  actorUid: string,
  existing?: Course,
): Course {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? crypto.randomUUID(),
    title: values.title.trim(),
    category: values.category,
    description: values.description.trim(),
    ...(values.imageUrl.trim() ? { imageUrl: values.imageUrl.trim() } : {}),
    type: values.type,
    priceInr: values.type === 'paid' ? Math.max(0, Math.round(values.priceInr)) : 0,
    durationWeeks: Math.min(104, Math.max(1, Math.round(values.durationWeeks))),
    level: values.level,
    language: values.language.trim() || 'English',
    trainerName: values.trainerName.trim(),
    ...(values.startDate ? { startDate: values.startDate } : {}),
    ...(values.endDate ? { endDate: values.endDate } : {}),
    syllabus: splitLines(values.syllabusText),
    outcomes: splitLines(values.outcomesText),
    certificateAvailable: values.certificateAvailable,
    status: existing?.status ?? 'draft',
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    createdBy: existing?.createdBy ?? actorUid,
    updatedBy: actorUid,
  };
}

export async function saveCourse(course: Course): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await setDoc(doc(db, 'courses', course.id), course);
}

export async function setCourseStatus(
  courseId: string,
  status: CourseStatus,
  actorUid: string,
): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await updateDoc(doc(db, 'courses', courseId), {
    status,
    updatedAt: new Date().toISOString(),
    updatedBy: actorUid,
  });
}

export async function deleteCourse(courseId: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'courses', courseId));
}

/** Published courses, visible to everyone (catalog). */
export function subscribePublishedCourses(
  onChange: (courses: Course[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    query(collection(db, 'courses'), where('status', '==', 'published')),
    snapshot => {
      const courses = snapshot.docs.map(item => item.data() as Course);
      courses.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      onChange(courses);
    },
    onError,
  );
}

/** All courses regardless of status (admin manager). */
export function subscribeAllCourses(
  onChange: (courses: Course[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    collection(db, 'courses'),
    snapshot => {
      const courses = snapshot.docs.map(item => item.data() as Course);
      courses.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      onChange(courses);
    },
    onError,
  );
}
