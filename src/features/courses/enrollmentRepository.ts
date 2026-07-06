import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../firebase';
import type { Course, Enrollment } from './courseTypes';
import { enrollmentIdFor } from './courseTypes';

/**
 * Enroll the signed-in member into a free published course.
 * Paid enrollment is intentionally blocked until the Razorpay phase ships:
 * payment must be verified server-side before an enrollment becomes active.
 */
export async function enrollInFreeCourse(
  course: Course,
  memberUid: string,
  memberName: string,
): Promise<Enrollment> {
  if (!db) throw new Error('Firestore is not configured.');
  if (course.status !== 'published') throw new Error('This course is not open for enrollment.');
  if (course.type !== 'free') {
    throw new Error('Online payment is opening soon. Paid course enrollment is not yet available.');
  }
  const enrollment: Enrollment = {
    id: enrollmentIdFor(course.id, memberUid),
    courseId: course.id,
    courseTitle: course.title,
    memberUid,
    memberName,
    enrolledAt: new Date().toISOString(),
    status: 'active',
    paymentStatus: 'not_required',
    paymentAmountInr: 0,
  };
  await setDoc(doc(db, 'enrollments', enrollment.id), enrollment);
  return enrollment;
}

export async function cancelEnrollment(enrollmentId: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await updateDoc(doc(db, 'enrollments', enrollmentId), { status: 'cancelled' });
}

/** The signed-in member's own enrollments. */
export function subscribeMyEnrollments(
  memberUid: string,
  onChange: (enrollments: Enrollment[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    query(collection(db, 'enrollments'), where('memberUid', '==', memberUid)),
    snapshot => {
      const enrollments = snapshot.docs.map(item => item.data() as Enrollment);
      enrollments.sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt));
      onChange(enrollments);
    },
    onError,
  );
}

/** All enrollments (admin reporting and per-course counts). */
export function subscribeAllEnrollments(
  onChange: (enrollments: Enrollment[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    collection(db, 'enrollments'),
    snapshot => {
      const enrollments = snapshot.docs.map(item => item.data() as Enrollment);
      enrollments.sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt));
      onChange(enrollments);
    },
    onError,
  );
}
