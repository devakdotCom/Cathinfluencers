import fs from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { expect } from 'vitest';

let environment: RulesTestEnvironment;

const privateMember = {
  id: 'member-1',
  ownerUid: 'owner-1',
  fullName: 'Owner One',
  email: 'owner@example.org',
  status: 'Active',
  membershipClass: 'Active',
  diocese: 'Madras-Mylapore',
};

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'vox-ecclesiae-rules-test',
    firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') },
  });
});

beforeEach(async () => environment.clearFirestore());
afterAll(async () => environment.cleanup());

describe('Firestore privacy rules', () => {
  it('allows public directory reads but denies private anonymous reads', async () => {
    await environment.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'publicMembers/member-1'), {
        id: 'member-1',
        ownerUid: 'owner-1',
        fullName: 'Owner One',
        status: 'Active',
        membershipClass: 'Active',
      });
      await setDoc(doc(context.firestore(), 'members/member-1'), privateMember);
    });
    const anonymous = environment.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(anonymous, 'publicMembers/member-1')));
    await assertFails(getDoc(doc(anonymous, 'members/member-1')));
  });

  it('requires owners to submit approval requests instead of writing profiles', async () => {
    const owner = environment.authenticatedContext('owner-1').firestore();
    await assertFails(setDoc(doc(owner, 'members/member-1'), privateMember));
    await assertFails(setDoc(doc(owner, 'publicMembers/member-1'), {
      id: 'member-1',
      ownerUid: 'owner-1',
      fullName: 'Owner One',
      status: 'Active',
      membershipClass: 'Active',
    }));
    await environment.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'members/member-1'), privateMember);
    });
    await assertSucceeds(getDoc(doc(owner, 'members/member-1')));
    await assertFails(updateDoc(doc(owner, 'members/member-1'), { fullName: 'Bypassed Update' }));
    await assertSucceeds(setDoc(doc(owner, 'approvalRequests/request-1'), {
      id: 'request-1',
      kind: 'member_update',
      ownerUid: 'owner-1',
      ownerName: 'Owner One',
      title: 'Profile update: Owner One',
      summary: 'Santhome',
      status: 'pending',
      payload: { ...privateMember, fullName: 'Reviewed Update' },
      createdAt: new Date().toISOString(),
    }));
  });

  it('allows admins to review submissions and create private notifications', async () => {
    const admin = environment.authenticatedContext('admin-1', { admin: true }).firestore();
    await assertSucceeds(setDoc(doc(admin, 'announcements/ann-1'), {
      id: 'ann-1',
      title: 'Notice',
      content: 'Content',
      author: 'Admin',
      createdAt: new Date().toISOString(),
      priority: 'high',
    }));
    await assertSucceeds(setDoc(doc(admin, 'activityLogs/log-1'), {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      action: 'Approval granted',
      memberId: 'member-1',
      memberName: 'Owner One',
      details: 'Reviewed member update',
    }));
    await assertSucceeds(setDoc(doc(admin, 'notifications/notice-1'), {
      id: 'notice-1',
      recipientUid: 'owner-1',
      type: 'approval',
      title: 'Submission approved',
      message: 'Your profile was approved.',
      createdAt: new Date().toISOString(),
    }));
    await assertFails(deleteDoc(doc(admin, 'memberChangeRequests/request-unknown')));
  });

  it('allows moderators to publish reviewed content without granting admin-profile access', async () => {
    const moderator = environment.authenticatedContext('moderator-1', { moderator: true }).firestore();
    await assertSucceeds(setDoc(doc(moderator, 'announcements/ann-moderated'), {
      id: 'ann-moderated',
      title: 'Reviewed notice',
      content: 'Approved by a moderator.',
      author: 'Moderator',
      createdAt: new Date().toISOString(),
      priority: 'medium',
    }));
    await assertFails(setDoc(doc(moderator, 'adminProfiles/moderator-1'), {
      id: 'moderator-1',
      name: 'Moderator',
      email: 'moderator@example.org',
      voxId: 'moderator@vox.in',
      addedAt: new Date().toISOString(),
    }));
  });

  it('allows public reflection reads but restricts overrides to admins', async () => {
    const reflection = {
      date: '2026-06-12',
      en: { gospel: 'Gospel', reflection: 'Reflection', prayer: 'Prayer', saintQuote: 'Quote', action: 'Action' },
      ta: { gospel: 'நற்செய்தி', reflection: 'சிந்தனை', prayer: 'ஜெபம்', saintQuote: 'மொழி', action: 'செயல்' },
      source: 'admin',
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin-1',
    };
    const admin = environment.authenticatedContext('admin-1', { admin: true }).firestore();
    const moderator = environment.authenticatedContext('moderator-1', { moderator: true }).firestore();
    await assertSucceeds(setDoc(doc(admin, 'dailyReflections/2026-06-12'), reflection));
    await assertSucceeds(getDoc(doc(environment.unauthenticatedContext().firestore(), 'dailyReflections/2026-06-12')));
    await assertFails(setDoc(doc(moderator, 'dailyReflections/2026-06-13'), {
      ...reflection,
      date: '2026-06-13',
      updatedBy: 'moderator-1',
    }));
  });

  it('keeps notifications and saved profiles private to their owner', async () => {
    await environment.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'notifications/notice-1'), {
        id: 'notice-1',
        recipientUid: 'owner-1',
        type: 'system',
        title: 'Private notice',
        message: 'Only the recipient should read this.',
        createdAt: new Date().toISOString(),
      });
    });
    const owner = environment.authenticatedContext('owner-1').firestore();
    const stranger = environment.authenticatedContext('owner-2').firestore();
    await assertSucceeds(getDoc(doc(owner, 'notifications/notice-1')));
    await assertFails(getDoc(doc(stranger, 'notifications/notice-1')));
    await assertSucceeds(updateDoc(doc(owner, 'notifications/notice-1'), {
      readAt: new Date().toISOString(),
    }));
    await assertSucceeds(setDoc(doc(owner, 'savedMembers/owner-1_member-1'), {
      id: 'owner-1_member-1',
      ownerUid: 'owner-1',
      memberId: 'member-1',
      createdAt: new Date().toISOString(),
    }));
    await assertFails(getDoc(doc(stranger, 'savedMembers/owner-1_member-1')));
  });

  it('issues opaque credentials without exposing member or owner IDs publicly', async () => {
    await environment.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'members/member-1'), privateMember);
    });
    const owner = environment.authenticatedContext('owner-1').firestore();
    const credentialId = 'a'.repeat(64);
    const issuedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 86_400_000).toISOString();
    const batch = writeBatch(owner);
    batch.set(doc(owner, `privateCredentials/${credentialId}`), {
      id: credentialId,
      ownerUid: 'owner-1',
      memberId: 'member-1',
      displayName: 'Owner One',
      status: 'Active',
      diocese: 'Madras-Mylapore',
      issuedAt,
      expiresAt,
    });
    batch.set(doc(owner, `publicCredentials/${credentialId}`), {
      id: credentialId,
      displayName: 'Owner One',
      status: 'Active',
      diocese: 'Madras-Mylapore',
      issuedAt,
      expiresAt,
    });
    batch.set(doc(owner, 'memberCredentialPointers/member-1'), {
      memberId: 'member-1',
      ownerUid: 'owner-1',
      credentialId,
      updatedAt: issuedAt,
    });
    batch.set(doc(owner, 'credentialAuditLogs/audit-1'), {
      id: 'audit-1',
      actorUid: 'owner-1',
      ownerUid: 'owner-1',
      credentialId,
      action: 'issued',
      createdAt: issuedAt,
    });
    await assertSucceeds(batch.commit());

    const anonymous = environment.unauthenticatedContext().firestore();
    const publicSnapshot = await assertSucceeds(
      getDoc(doc(anonymous, `publicCredentials/${credentialId}`)),
    );
    expect(publicSnapshot.data()).not.toHaveProperty('memberId');
    expect(publicSnapshot.data()).not.toHaveProperty('ownerUid');
    await assertFails(getDocs(collection(anonymous, 'publicCredentials')));
    await assertFails(getDoc(doc(anonymous, `privateCredentials/${credentialId}`)));
  });
});
