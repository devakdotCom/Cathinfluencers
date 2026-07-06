import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export async function saveEventAvailability(
  eventId: string,
  memberId: string,
  ownerUid: string,
  status: 'available' | 'not_available',
) {
  if (!db) throw new Error('Firestore is not configured.');
  const id = `${eventId}_${memberId}`;
  await setDoc(doc(db, 'eventAvailabilities', id), {
    id,
    eventId,
    memberId,
    ownerUid,
    status,
    updatedAt: serverTimestamp(),
  });
}
