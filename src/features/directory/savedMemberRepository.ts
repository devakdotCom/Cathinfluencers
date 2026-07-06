import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../firebase';

export function subscribeSavedMemberIds(
  ownerUid: string,
  onChange: (memberIds: string[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    query(collection(db, 'savedMembers'), where('ownerUid', '==', ownerUid)),
    snapshot =>
      onChange(snapshot.docs.map(item => String(item.data().memberId))),
    onError,
  );
}

export async function toggleSavedMember(
  ownerUid: string,
  memberId: string,
  shouldSave: boolean,
) {
  if (!db) throw new Error('Firestore is not configured.');
  const id = `${ownerUid}_${memberId}`;
  if (!shouldSave) {
    await deleteDoc(doc(db, 'savedMembers', id));
    return;
  }
  await setDoc(doc(db, 'savedMembers', id), {
    id,
    ownerUid,
    memberId,
    createdAt: new Date().toISOString(),
  });
}

