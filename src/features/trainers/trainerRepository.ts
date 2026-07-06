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
import type {
  Trainer,
  TrainerApplication,
  TrainerApplicationFormValues,
} from './trainerTypes';

function splitList(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 25);
}

/** Submit (or resubmit while pending/rejected) a trainer application. */
export async function submitTrainerApplication(
  values: TrainerApplicationFormValues,
  applicantUid: string,
): Promise<TrainerApplication> {
  if (!db) throw new Error('Firestore is not configured.');
  const now = new Date().toISOString();
  const application: TrainerApplication = {
    id: applicantUid,
    applicantUid,
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    mobile: values.mobile.trim(),
    qualification: values.qualification.trim(),
    skills: splitList(values.skillsText),
    teachingExperience: values.teachingExperience.trim(),
    courseTopics: splitList(values.courseTopicsText),
    bio: values.bio.trim(),
    ...(values.profileImageUrl.trim() ? { profileImageUrl: values.profileImageUrl.trim() } : {}),
    ...(values.sampleVideoUrl.trim() ? { sampleVideoUrl: values.sampleVideoUrl.trim() } : {}),
    preference: values.preference,
    availability: values.availability.trim(),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, 'trainerApplications', application.id), application);
  return application;
}

export function subscribeMyApplication(
  applicantUid: string,
  onChange: (application: TrainerApplication | null) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    doc(db, 'trainerApplications', applicantUid),
    snapshot => onChange(snapshot.exists() ? (snapshot.data() as TrainerApplication) : null),
    onError,
  );
}

export function subscribeAllApplications(
  onChange: (applications: TrainerApplication[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    collection(db, 'trainerApplications'),
    snapshot => {
      const applications = snapshot.docs.map(item => item.data() as TrainerApplication);
      applications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onChange(applications);
    },
    onError,
  );
}

/** Approve: creates the public trainer profile, then marks the application. */
export async function approveTrainer(
  application: TrainerApplication,
  adminUid: string,
): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const now = new Date().toISOString();
  const trainer: Trainer = {
    id: application.applicantUid,
    fullName: application.fullName,
    qualification: application.qualification,
    skills: application.skills,
    courseTopics: application.courseTopics,
    bio: application.bio,
    ...(application.profileImageUrl ? { profileImageUrl: application.profileImageUrl } : {}),
    preference: application.preference,
    active: true,
    approvedBy: adminUid,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, 'trainers', trainer.id), trainer);
  await updateDoc(doc(db, 'trainerApplications', application.id), {
    status: 'approved',
    reviewedBy: adminUid,
    updatedAt: now,
  });
}

export async function rejectTrainer(
  applicationId: string,
  adminUid: string,
  reviewNote?: string,
): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await updateDoc(doc(db, 'trainerApplications', applicationId), {
    status: 'rejected',
    reviewedBy: adminUid,
    updatedAt: new Date().toISOString(),
    ...(reviewNote ? { reviewNote } : {}),
  });
}

export async function setTrainerActive(
  trainerId: string,
  active: boolean,
): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await updateDoc(doc(db, 'trainers', trainerId), {
    active,
    updatedAt: new Date().toISOString(),
  });
}

/** Public, active trainer directory. */
export function subscribeActiveTrainers(
  onChange: (trainers: Trainer[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    query(collection(db, 'trainers'), where('active', '==', true)),
    snapshot => {
      const trainers = snapshot.docs.map(item => item.data() as Trainer);
      trainers.sort((a, b) => a.fullName.localeCompare(b.fullName));
      onChange(trainers);
    },
    onError,
  );
}

/** All trainer profiles, including deactivated (admin). */
export function subscribeAllTrainers(
  onChange: (trainers: Trainer[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    collection(db, 'trainers'),
    snapshot => {
      const trainers = snapshot.docs.map(item => item.data() as Trainer);
      trainers.sort((a, b) => a.fullName.localeCompare(b.fullName));
      onChange(trainers);
    },
    onError,
  );
}
