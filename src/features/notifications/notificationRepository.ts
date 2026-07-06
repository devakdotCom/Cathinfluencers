import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../firebase';
import type { AppNotification } from '../../types';

export function subscribeNotifications(
  recipientUid: string,
  onChange: (notifications: AppNotification[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    query(
      collection(db, 'notifications'),
      where('recipientUid', '==', recipientUid),
    ),
    snapshot => {
      const notifications = snapshot.docs.map(
        item => item.data() as AppNotification,
      );
      notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onChange(notifications);
    },
    onError,
  );
}

export async function markNotificationRead(notificationId: string) {
  if (!db) throw new Error('Firestore is not configured.');
  await updateDoc(doc(db, 'notifications', notificationId), {
    readAt: new Date().toISOString(),
  });
}

