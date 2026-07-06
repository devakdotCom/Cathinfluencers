import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { memberSchema } from '../../schemas/memberSchema';
import type {
  Announcement,
  ApprovalKind,
  ApprovalRequest,
  CalendarEvent,
  Member,
} from '../../types';
import { toPublicMember } from '../../utils/memberPrivacy';

export interface SubmitApprovalInput {
  kind: ApprovalKind;
  title: string;
  summary: string;
  ownerUid: string;
  ownerName: string;
  targetId?: string;
  payload: Record<string, unknown>;
}

export async function submitApprovalRequest(input: SubmitApprovalInput) {
  if (!db) throw new Error('Firestore is not configured.');
  const id = crypto.randomUUID();
  const request: ApprovalRequest = {
    id,
    ...input,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'approvalRequests', id), request);
  return id;
}

export function subscribePendingApprovals(
  onChange: (requests: ApprovalRequest[]) => void,
  onError: (error: Error) => void,
) {
  if (!db) return () => undefined;
  let currentRequests: ApprovalRequest[] = [];
  let legacyRequests: ApprovalRequest[] = [];
  const emit = () => {
    const requests = [...currentRequests, ...legacyRequests];
    requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    onChange(requests);
  };
  const unsubscribeCurrent = onSnapshot(
    query(collection(db, 'approvalRequests'), where('status', '==', 'pending')),
    snapshot => {
      currentRequests = snapshot.docs.map(item => ({
        ...(item.data() as ApprovalRequest),
        sourceCollection: 'approvalRequests',
      }));
      emit();
    },
    onError,
  );
  const unsubscribeLegacy = onSnapshot(
    query(collection(db, 'memberChangeRequests'), where('status', '==', 'pending')),
    snapshot => {
      legacyRequests = snapshot.docs.map(item => {
        const data = item.data() as {
          id?: string;
          memberId: string;
          ownerUid: string;
          proposedProfile: Member;
          createdAt?: { toDate?: () => Date };
        };
        return {
          id: data.id || item.id,
          kind: 'member_update',
          status: 'pending',
          title: `Legacy profile update: ${data.proposedProfile.fullName}`,
          summary: data.proposedProfile.parish || 'Parish not listed',
          ownerUid: data.ownerUid,
          ownerName: data.proposedProfile.fullName,
          targetId: data.memberId,
          payload: data.proposedProfile as unknown as Record<string, unknown>,
          createdAt:
            data.createdAt?.toDate?.().toISOString() || new Date(0).toISOString(),
          sourceCollection: 'memberChangeRequests',
        };
      });
      emit();
    },
    onError,
  );
  return () => {
    unsubscribeCurrent();
    unsubscribeLegacy();
  };
}

function notificationFor(
  request: ApprovalRequest,
  decision: 'approve' | 'reject' | 'request_changes',
  note: string,
) {
  const approved = decision === 'approve';
  const changesRequested = decision === 'request_changes';
  return {
    id: crypto.randomUUID(),
    recipientUid: request.ownerUid,
    type: 'approval',
    title: approved
      ? 'Submission approved'
      : changesRequested
        ? 'Changes requested'
        : 'Submission rejected',
    message:
      note ||
      `${request.title} was ${approved ? 'approved' : changesRequested ? 'returned for changes' : 'rejected'} by a reviewer.`,
    createdAt: new Date().toISOString(),
    actionTarget: request.kind.startsWith('member') ? '/profile' : '/',
  };
}

function applyRequestPayload(
  batch: ReturnType<typeof writeBatch>,
  request: ApprovalRequest,
) {
  if (!db) throw new Error('Firestore is not configured.');

  if (request.kind === 'member_create' || request.kind === 'member_update') {
    const validated = memberSchema.parse(request.payload) as Member;
    const member =
      request.kind === 'member_create'
        ? { ...validated, status: 'Affiliated' as const }
        : validated;
    batch.set(doc(db, 'members', member.id), member);
    batch.set(doc(db, 'publicMembers', member.id), toPublicMember(member));
    return;
  }

  if (request.kind === 'announcement') {
    const announcement = request.payload as unknown as Announcement;
    batch.set(doc(db, 'announcements', announcement.id), announcement);
    return;
  }

  if (request.kind === 'event') {
    const event = request.payload as unknown as CalendarEvent;
    batch.set(doc(db, 'calendarEvents', event.id), event);
    return;
  }

  if (request.kind === 'ai_content') {
    const publishAs = String(request.payload.publishAs || '');
    if (publishAs === 'member_biography') {
      const member = memberSchema.parse(request.payload.member) as Member;
      batch.set(doc(db, 'members', member.id), member);
      batch.set(doc(db, 'publicMembers', member.id), toPublicMember(member));
    } else if (publishAs === 'announcement') {
      const announcement = request.payload.content as Announcement;
      batch.set(doc(db, 'announcements', announcement.id), announcement);
    } else if (publishAs === 'event') {
      const event = request.payload.content as CalendarEvent;
      batch.set(doc(db, 'calendarEvents', event.id), event);
    }
  }
}

export async function reviewApprovalRequest(
  request: ApprovalRequest,
  decision: 'approve' | 'reject' | 'request_changes',
  reviewerUid: string,
  note = '',
) {
  if (!db) throw new Error('Firestore is not configured.');
  const batch = writeBatch(db);
  if (decision === 'approve') applyRequestPayload(batch, request);
  batch.update(doc(db, request.sourceCollection || 'approvalRequests', request.id), {
    status: decision === 'approve'
      ? 'approved'
      : decision === 'request_changes'
        ? 'changes_requested'
        : 'rejected',
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewerUid,
    reviewNote: note,
  });
  const notification = notificationFor(request, decision, note);
  batch.set(doc(db, 'notifications', notification.id), notification);
  const auditId = crypto.randomUUID();
  batch.set(doc(db, 'activityLogs', auditId), {
    id: auditId,
    timestamp: new Date().toISOString(),
    action: decision === 'approve'
      ? 'Approval granted'
      : decision === 'request_changes'
        ? 'Changes requested'
        : 'Approval rejected',
    memberId: request.targetId || request.id,
    memberName: request.ownerName,
    details: `${request.kind}: ${request.title}`,
  });
  await batch.commit();
}
