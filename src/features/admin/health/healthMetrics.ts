import type { Member } from '../../../types';

export interface DuplicateGroup {
  reason: 'email' | 'phone' | 'name-and-parish';
  members: Member[];
}

function normalize(value: string | undefined) {
  return (value || '').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

export function findDuplicateMembers(members: Member[]): DuplicateGroup[] {
  const groups = new Map<string, { reason: DuplicateGroup['reason']; members: Member[] }>();
  const candidates: Array<[DuplicateGroup['reason'], (member: Member) => string]> = [
    ['email', member => normalize(member.email)],
    ['phone', member => normalize(member.phone)],
    ['name-and-parish', member => `${normalize(member.fullName)}:${normalize(member.parish)}`],
  ];

  for (const [reason, selector] of candidates) {
    for (const member of members) {
      const key = selector(member);
      if (!key || key === ':') continue;
      const composite = `${reason}:${key}`;
      const group = groups.get(composite) || { reason, members: [] };
      group.members.push(member);
      groups.set(composite, group);
    }
  }

  return [...groups.values()].filter(group => group.members.length > 1);
}

export function getDirectoryHealth(members: Member[]) {
  const pending = members.filter(member => member.status === 'Pending').length;
  const missingOwner = members.filter(member => !member.ownerUid).length;
  const missingProfileImage = members.filter(member => !member.photoURL).length;
  const stale = members.filter(member => {
    const lastActive = Date.parse(member.lastActive);
    return !Number.isFinite(lastActive) || Date.now() - lastActive > 180 * 24 * 60 * 60 * 1_000;
  }).length;
  const duplicates = findDuplicateMembers(members);
  const issues = pending + missingOwner + missingProfileImage + stale + duplicates.length;
  const score = members.length === 0
    ? 100
    : Math.max(0, Math.round(100 - (issues / members.length) * 20));

  return { score, pending, missingOwner, missingProfileImage, stale, duplicates };
}
