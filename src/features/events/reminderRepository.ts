import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export async function subscribeEventReminder(eventId: string, ownerUid: string) {
  if (!db) throw new Error('Firestore is not configured.');
  const id = `${ownerUid}_${eventId}`;
  await setDoc(doc(db, 'eventReminderSubscriptions', id), {
    id,
    ownerUid,
    eventId,
    channels: ['email'],
    status: 'active',
    createdAt: serverTimestamp(),
  });
}

export async function unsubscribeEventReminder(eventId: string, ownerUid: string) {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'eventReminderSubscriptions', `${ownerUid}_${eventId}`));
}
