import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { memberSchema } from '../schemas/memberSchema';
import type { Member } from '../types';
import { submitApprovalRequest } from '../features/approvals/approvalRepository';
import { toPublicMember } from '../utils/memberPrivacy';

export async function saveMemberRecord(member: Member) {
  if (!db) throw new Error('Firestore is not configured.');
  const validated = memberSchema.parse(member);
  const batch = writeBatch(db);
  batch.set(doc(db, 'members', validated.id), validated);
  batch.set(doc(db, 'publicMembers', validated.id), toPublicMember(validated));
  await batch.commit();
}

export async function deleteMemberRecord(memberId: string) {
  if (!db) throw new Error('Firestore is not configured.');
  const batch = writeBatch(db);
  batch.delete(doc(db, 'members', memberId));
  batch.delete(doc(db, 'publicMembers', memberId));
  await batch.commit();
}

export async function requestMemberChange(
  member: Member,
  requestedBy: string,
  ownerName: string,
  isNew: boolean,
) {
  const validated = memberSchema.parse(member);
  return submitApprovalRequest({
    kind: isNew ? 'member_create' : 'member_update',
    title: `${isNew ? 'New member' : 'Profile update'}: ${validated.fullName}`,
    summary: `${validated.parish || 'Parish not listed'} | ${validated.diocese || 'Diocese not listed'}`,
    ownerUid: requestedBy,
    ownerName,
    targetId: validated.id,
    payload: validated,
  });
}
