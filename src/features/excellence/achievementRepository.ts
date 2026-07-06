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
import type { Achievement, AchievementFormValues, AchievementStatus } from './achievementTypes';

/** Member submission: always enters the review queue as 'pending'. */
export async function submitAchievement(
  values: AchievementFormValues,
  memberUid: string,
): Promise<Achievement> {
  if (!db) throw new Error('Firestore is not configured.');
  const now = new Date().toISOString();
  const achievement: Achievement = {
    id: crypto.randomUUID(),
    title: values.title.trim(),
    memberName: values.memberName.trim(),
    memberUid,
    category: values.category,
    description: values.description.trim(),
    ...(values.imageUrl.trim() ? { imageUrl: values.imageUrl.trim() } : {}),
    ...(values.proofUrl.trim() ? { proofUrl: values.proofUrl.trim() } : {}),
    achievedOn: values.achievedOn || now.slice(0, 10),
    ...(values.parish.trim() ? { parish: values.parish.trim() } : {}),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    createdBy: memberUid,
    updatedBy: memberUid,
  };
  await setDoc(doc(db, 'achievements', achievement.id), achievement);
  return achievement;
}

/** Admin review actions: approve, reject, publish, unpublish (back to approved). */
export async function reviewAchievement(
  achievementId: string,
  status: AchievementStatus,
  adminUid: string,
  reviewNote?: string,
): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await updateDoc(doc(db, 'achievements', achievementId), {
    status,
    updatedAt: new Date().toISOString(),
    updatedBy: adminUid,
    approvedBy: adminUid,
    ...(reviewNote !== undefined ? { reviewNote } : {}),
    ...(status === 'published' ? { publishedAt: new Date().toISOString() } : {}),
  });
}

export async function deleteAchievement(achievementId: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'achievements', achievementId));
}

/** Published wall, visible to everyone. */
export function subscribePublishedAchievements(
  onChange: (achievements: Achievement[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    query(collection(db, 'achievements'), where('status', '==', 'published')),
    snapshot => {
      const achievements = snapshot.docs.map(item => item.data() as Achievement);
      achievements.sort((a, b) => (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt));
      onChange(achievements);
    },
    onError,
  );
}

/** The signed-in member's own submissions, any status. */
export function subscribeMyAchievements(
  memberUid: string,
  onChange: (achievements: Achievement[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    query(collection(db, 'achievements'), where('memberUid', '==', memberUid)),
    snapshot => {
      const achievements = snapshot.docs.map(item => item.data() as Achievement);
      achievements.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onChange(achievements);
    },
    onError,
  );
}

/** Everything, for the admin review manager. */
export function subscribeAllAchievements(
  onChange: (achievements: Achievement[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    collection(db, 'achievements'),
    snapshot => {
      const achievements = snapshot.docs.map(item => item.data() as Achievement);
      achievements.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onChange(achievements);
    },
    onError,
  );
}
