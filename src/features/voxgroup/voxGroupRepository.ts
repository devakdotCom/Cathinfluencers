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
  VoxGroupActivity,
  VoxGroupId,
  VoxGroupMembership,
} from './voxGroupTypes';
import { membershipIdFor } from './voxGroupTypes';

/** Join a pillar (or rejoin after leaving). Deterministic id prevents duplicates. */
export async function joinGroup(
  groupId: VoxGroupId,
  memberUid: string,
  memberName: string,
): Promise<VoxGroupMembership> {
  if (!db) throw new Error('Firestore is not configured.');
  const membership: VoxGroupMembership = {
    id: membershipIdFor(groupId, memberUid),
    groupId,
    memberUid,
    memberName,
    joinedAt: new Date().toISOString(),
    status: 'active',
  };
  await setDoc(doc(db, 'voxGroupMembers', membership.id), membership);
  return membership;
}

export async function leaveGroup(groupId: VoxGroupId, memberUid: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await updateDoc(doc(db, 'voxGroupMembers', membershipIdFor(groupId, memberUid)), {
    status: 'left',
  });
}

/** All active memberships (signed-in users; used for counts and admin lists). */
export function subscribeGroupMemberships(
  onChange: (memberships: VoxGroupMembership[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    query(collection(db, 'voxGroupMembers'), where('status', '==', 'active')),
    snapshot => {
      const memberships = snapshot.docs.map(item => item.data() as VoxGroupMembership);
      memberships.sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
      onChange(memberships);
    },
    onError,
  );
}

/** The signed-in member's own memberships, any status. */
export function subscribeMyMemberships(
  memberUid: string,
  onChange: (memberships: VoxGroupMembership[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    query(collection(db, 'voxGroupMembers'), where('memberUid', '==', memberUid)),
    snapshot => onChange(snapshot.docs.map(item => item.data() as VoxGroupMembership)),
    onError,
  );
}

/** Group activities and announcements; public read. */
export function subscribeGroupActivities(
  onChange: (activities: VoxGroupActivity[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    query(collection(db, 'voxGroupActivities'), where('status', '==', 'active')),
    snapshot => {
      const activities = snapshot.docs.map(item => item.data() as VoxGroupActivity);
      activities.sort((a, b) => (b.activityDate ?? b.createdAt).localeCompare(a.activityDate ?? a.createdAt));
      onChange(activities);
    },
    onError,
  );
}

/** All activities including archived (admin). */
export function subscribeAllGroupActivities(
  onChange: (activities: VoxGroupActivity[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  return onSnapshot(
    collection(db, 'voxGroupActivities'),
    snapshot => {
      const activities = snapshot.docs.map(item => item.data() as VoxGroupActivity);
      activities.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onChange(activities);
    },
    onError,
  );
}

export interface ActivityInput {
  groupId: VoxGroupId;
  title: string;
  description: string;
  activityDate?: string;
}

export async function createGroupActivity(
  input: ActivityInput,
  adminUid: string,
): Promise<VoxGroupActivity> {
  if (!db) throw new Error('Firestore is not configured.');
  const now = new Date().toISOString();
  const activity: VoxGroupActivity = {
    id: crypto.randomUUID(),
    groupId: input.groupId,
    title: input.title.trim(),
    description: input.description.trim(),
    ...(input.activityDate ? { activityDate: input.activityDate } : {}),
    status: 'active',
    createdAt: now,
    createdBy: adminUid,
    updatedAt: now,
    updatedBy: adminUid,
  };
  await setDoc(doc(db, 'voxGroupActivities', activity.id), activity);
  return activity;
}

export async function setActivityStatus(
  activityId: string,
  status: VoxGroupActivity['status'],
  adminUid: string,
): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await updateDoc(doc(db, 'voxGroupActivities', activityId), {
    status,
    updatedAt: new Date().toISOString(),
    updatedBy: adminUid,
  });
}

export async function deleteGroupActivity(activityId: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  await deleteDoc(doc(db, 'voxGroupActivities', activityId));
}
