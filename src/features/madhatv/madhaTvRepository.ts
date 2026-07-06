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
import type {
  MadhaTvParticipant,
  MadhaTvProgram,
  ParticipantStatus,
  ProgramFormValues,
  ProgramStatus,
} from './madhaTvTypes';
import { participantIdFor } from './madhaTvTypes';

export function programFromForm(
  values: ProgramFormValues,
  actorUid: string,
  existing?: MadhaTvProgram,
): MadhaTvProgram {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? crypto.randomUUID(),
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category,
    ...(values.thumbnailUrl.trim() ? { thumbnailUrl: values.thumbnailUrl.trim() } : {}),
    ...(values.videoUrl.trim() ? { videoUrl: values.videoUrl.trim() } : {}),
    ...(values.programDate ? { programDate: values.programDate } : {}),
    participationOpen: values.participationOpen,
    status: existing?.status ?? 'draft',
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    createdBy: existing?.createdBy ?? actorUid,
    updatedBy: actorUid,
  };
}

export async function saveProgram(program: MadhaTvProgram): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await setDoc(doc(db, 'madhaTvPrograms', program.id), program);
}

export async function setProgramStatus(
  programId: string,
  status: ProgramStatus,
  actorUid: string,
): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await updateDoc(doc(db, 'madhaTvPrograms', programId), {
    status,
    updatedAt: new Date().toISOString(),
    updatedBy: actorUid,
  });
}

export async function deleteProgram(programId: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'madhaTvPrograms', programId));
}

export function subscribePublishedPrograms(
  onChange: (programs: MadhaTvProgram[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    query(collection(db, 'madhaTvPrograms'), where('status', '==', 'published')),
    snapshot => {
      const programs = snapshot.docs.map(item => item.data() as MadhaTvProgram);
      programs.sort((a, b) => (b.programDate ?? b.updatedAt).localeCompare(a.programDate ?? a.updatedAt));
      onChange(programs);
    },
    onError,
  );
}

export function subscribeAllPrograms(
  onChange: (programs: MadhaTvProgram[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    collection(db, 'madhaTvPrograms'),
    snapshot => {
      const programs = snapshot.docs.map(item => item.data() as MadhaTvProgram);
      programs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      onChange(programs);
    },
    onError,
  );
}

/** Register the signed-in member for a published, open program. */
export async function registerParticipant(
  program: MadhaTvProgram,
  memberUid: string,
  memberName: string,
): Promise<MadhaTvParticipant> {
  if (!db) throw new Error('Firestore is not configured.');
  if (program.status !== 'published' || !program.participationOpen) {
    throw new Error('Registration for this program is not open.');
  }
  const participant: MadhaTvParticipant = {
    id: participantIdFor(program.id, memberUid),
    programId: program.id,
    programTitle: program.title,
    memberUid,
    memberName,
    status: 'pending',
    registeredAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'madhaTvParticipants', participant.id), participant);
  return participant;
}

export async function reviewParticipant(
  participantId: string,
  status: ParticipantStatus,
  reviewNote?: string,
): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await updateDoc(doc(db, 'madhaTvParticipants', participantId), {
    status,
    ...(reviewNote ? { reviewNote } : {}),
  });
}

export function subscribeMyParticipations(
  memberUid: string,
  onChange: (participants: MadhaTvParticipant[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    query(collection(db, 'madhaTvParticipants'), where('memberUid', '==', memberUid)),
    snapshot => onChange(snapshot.docs.map(item => item.data() as MadhaTvParticipant)),
    onError,
  );
}

export function subscribeAllParticipants(
  onChange: (participants: MadhaTvParticipant[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    collection(db, 'madhaTvParticipants'),
    snapshot => {
      const participants = snapshot.docs.map(item => item.data() as MadhaTvParticipant);
      participants.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
      onChange(participants);
    },
    onError,
  );
}
