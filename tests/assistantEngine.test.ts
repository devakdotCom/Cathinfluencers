import { describe, expect, it } from 'vitest';
import {
  createAnnouncementDraft,
  createEventDraft,
  draftBiographyLocally,
  findMatchingMembers,
  suggestMinistries,
} from '../src/features/ai/assistantEngine';
import type { Member } from '../src/types';

function member(overrides: Partial<Member> = {}): Member {
  return {
    id: 'member-1',
    ownerUid: 'owner-1',
    firstName: 'Maria',
    lastName: 'Joseph',
    fullName: 'Maria Joseph',
    email: 'maria@example.org',
    phone: '',
    dob: '',
    gender: 'Female',
    relationship: '',
    bloodGroup: '',
    diocese: 'Madras-Mylapore',
    parish: 'Santhome',
    parishPriest: '',
    country: 'India',
    currentAddress: '',
    address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
    membershipClass: 'Active',
    profession: 'Video editor',
    ambition: 'serve youth through Catholic media',
    hobbies: '',
    techSkills: ['Video Editing', 'Photography'],
    softSkills: ['Teamwork'],
    goals: [],
    support: [],
    pledgesAccepted: true,
    joinedDate: '2026-01-01',
    status: 'Active',
    avatarUrl: '',
    notes: '',
    customFields: [],
    lastActive: '2026-06-01',
    ...overrides,
  };
}

describe('assistant engine', () => {
  it('finds collaborators using skills and parish context', () => {
    const results = findMatchingMembers('video santhome', [
      member(),
      member({
        id: 'member-2',
        fullName: 'Writer Two',
        parish: 'Velachery',
        profession: 'Writer',
        techSkills: ['Writing'],
      }),
    ]);
    expect(results[0].id).toBe('member-1');
  });

  it('creates editable drafts without inventing credentials', () => {
    const biography = draftBiographyLocally(member());
    expect(biography).toContain('Maria Joseph');
    expect(biography).toContain('Video Editing');

    const announcement = createAnnouncementDraft('Media formation day', 'Admin');
    expect(announcement.publishAs).toBe('announcement');
    expect(announcement.structuredContent).toMatchObject({
      title: 'Media formation day',
    });

    const event = createEventDraft('Youth media workshop', '2026-08-15');
    expect(event.structuredContent).toMatchObject({
      date: '2026-08-15',
      category: 'Media',
    });
  });

  it('suggests ministries from member strengths', () => {
    expect(suggestMinistries(member(), '')).toContain(
      'Parish visual media and liturgical documentation',
    );
  });
});

