import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Member, PublicCredential } from '../../types';

interface PrivateCredential {
  id: string;
  ownerUid: string;
  memberId: string;
  displayName: string;
  status: string;
  diocese: string;
  issuedAt: string;
  expiresAt: string;
  revokedAt?: string;
}

export interface IssuedCredential {
  credential: PublicCredential;
  verificationUrl: string;
}

const verificationUrl = (id: string) =>
  `${window.location.origin}/verify?id=${encodeURIComponent(id)}`;

export async function getOrIssueCredential(
  member: Member,
  actorUid: string,
): Promise<IssuedCredential> {
  if (!db || !member.ownerUid) throw new Error('Credential service is unavailable.');
  if (!['Active', 'Affiliated', 'Director'].includes(member.status)) {
    throw new Error('Only approved active profiles can issue credentials.');
  }
  const pointerRef = doc(db, 'memberCredentialPointers', member.id);
  const pointer = await getDoc(pointerRef);
  if (pointer.exists()) {
    const id = String(pointer.data().credentialId || '');
    const publicSnapshot = id
      ? await getDoc(doc(db, 'publicCredentials', id))
      : null;
    if (publicSnapshot?.exists()) {
      const credential = publicSnapshot.data() as PublicCredential;
      if (!credential.revokedAt && Date.parse(credential.expiresAt) > Date.now()) {
        return { credential, verificationUrl: verificationUrl(id) };
      }
    }
  }

  const id = `${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`;
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const privateCredential: PrivateCredential = {
    id,
    ownerUid: member.ownerUid,
    memberId: member.id,
    displayName: member.fullName,
    status: member.status,
    diocese: member.diocese,
    issuedAt,
    expiresAt,
  };
  const publicCredential: PublicCredential = {
    id,
    displayName: member.fullName,
    displayNameTa: member.fullNameTa || '',
    status: member.status,
    diocese: member.diocese,
    issuedAt,
    expiresAt,
  };
  const auditId = crypto.randomUUID();
  const batch = writeBatch(db);
  batch.set(doc(db, 'privateCredentials', id), privateCredential);
  batch.set(doc(db, 'publicCredentials', id), publicCredential);
  batch.set(pointerRef, {
    memberId: member.id,
    ownerUid: member.ownerUid,
    credentialId: id,
    updatedAt: issuedAt,
  });
  batch.set(doc(db, 'credentialAuditLogs', auditId), {
    id: auditId,
    actorUid,
    ownerUid: member.ownerUid,
    credentialId: id,
    action: 'issued',
    createdAt: issuedAt,
  });
  await batch.commit();
  return { credential: publicCredential, verificationUrl: verificationUrl(id) };
}

export async function verifyPublicCredential(id: string) {
  if (!db || !/^[a-f0-9]{64}$/i.test(id)) return null;
  const snapshot = await getDoc(doc(db, 'publicCredentials', id));
  if (!snapshot.exists()) return null;
  const credential = snapshot.data() as PublicCredential;
  if (credential.revokedAt || Date.parse(credential.expiresAt) <= Date.now()) {
    return null;
  }
  return credential;
}

export async function revokeCredential(
  credentialId: string,
  actorUid: string,
) {
  if (!db) throw new Error('Credential service is unavailable.');
  const privateSnapshot = await getDoc(doc(db, 'privateCredentials', credentialId));
  if (!privateSnapshot.exists()) throw new Error('Credential not found.');
  const privateCredential = privateSnapshot.data() as PrivateCredential;
  const revokedAt = new Date().toISOString();
  const auditId = crypto.randomUUID();
  const batch = writeBatch(db);
  batch.update(doc(db, 'privateCredentials', credentialId), { revokedAt });
  batch.update(doc(db, 'publicCredentials', credentialId), { revokedAt });
  batch.set(doc(db, 'credentialAuditLogs', auditId), {
    id: auditId,
    actorUid,
    ownerUid: privateCredential.ownerUid,
    credentialId,
    action: 'revoked',
    createdAt: revokedAt,
  });
  await batch.commit();
}
