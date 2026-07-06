import { describe, expect, it } from 'vitest';
import { findDuplicateMembers, getDirectoryHealth } from '../src/features/admin/health/healthMetrics';
import type { Member } from '../src/types';

function member(overrides: Partial<Member>): Member {
  return {
    id: crypto.randomUUID(),
    ownerUid: crypto.randomUUID(),
    firstName: 'Maria',
    lastName: 'Joseph',
    fullName: 'Maria Joseph',
    email: 'maria@example.org',
    phone: '+91 9000000000',
    dob: '1990-01-01',
    gender: 'Female',
    relationship: 'Unmarried',
    bloodGroup: 'O+',
    diocese: 'Madras-Mylapore',
    parish: 'Santhome',
    parishPriest: '',
    country: 'India',
    currentAddress: 'Chennai',
    address: { street: '', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600001', country: 'India' },
    membershipClass: 'Active',
    ambition: 'Digital ministry',
    hobbies: 'Writing',
    techSkills: [],
    softSkills: [],
    goals: [],
    support: [],
    pledgesAccepted: true,
    joinedDate: '2026-01-01',
    status: 'Active',
    avatarUrl: 'bg-indigo-500',
    notes: '',
    customFields: [],
    lastActive: new Date().toISOString(),
    ...overrides,
  };
}

describe('directory health', () => {
  it('detects duplicate email and phone groups', () => {
    const members = [
      member({ id: 'one' }),
      member({ id: 'two', email: 'MARIA@example.org', phone: '+91-90000-00000' }),
    ];
    const reasons = findDuplicateMembers(members).map(group => group.reason);
    expect(reasons).toContain('email');
    expect(reasons).toContain('phone');
  });

  it('reports ownership and review issues', () => {
    const health = getDirectoryHealth([
      member({ ownerUid: undefined, status: 'Pending', photoURL: '' }),
    ]);
    expect(health.pending).toBe(1);
    expect(health.missingOwner).toBe(1);
    expect(health.score).toBeLessThan(100);
  });
});
