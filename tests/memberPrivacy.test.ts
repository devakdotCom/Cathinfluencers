import { describe, expect, it } from 'vitest';
import type { Member } from '../src/types';
import { toPublicMember } from '../src/utils/memberPrivacy';

const member = {
  id: 'member-1',
  ownerUid: 'owner-1',
  firstName: 'Maria',
  lastName: 'Joseph',
  fullName: 'Maria Joseph',
  fullNameTa: 'மரியா ஜோசப்',
  preferredLanguage: 'ta',
  email: 'private@example.org',
  phone: '9999999999',
  dob: '1990-01-01',
  gender: 'Female',
  relationship: 'Unmarried',
  bloodGroup: 'O+',
  diocese: 'Madras-Mylapore',
  parish: 'Santhome',
  parishPriest: '',
  country: 'India',
  currentAddress: 'Private address',
  address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
  membershipClass: 'Active',
  profession: 'Designer',
  instagram: 'private-handle',
  ambition: 'Serve Catholic media',
  biographyDraft: 'Biography',
  hobbies: '',
  techSkills: ['Design'],
  softSkills: [],
  goals: [],
  support: [],
  photoURL: 'https://example.org/photo.jpg',
  pledgesAccepted: true,
  joinedDate: '2026-01-01',
  status: 'Active',
  avatarUrl: '',
  notes: '',
  customFields: [],
  lastActive: '2026-06-01',
} satisfies Member;

describe('public member projection', () => {
  it('never exposes direct contact or ownership data', () => {
    const publicMember = toPublicMember(member);
    expect(publicMember).not.toHaveProperty('ownerUid');
    expect(publicMember).not.toHaveProperty('email');
    expect(publicMember).not.toHaveProperty('phone');
    expect(publicMember).not.toHaveProperty('currentAddress');
  });

  it('physically redacts optional fields when consent is disabled', () => {
    const publicMember = toPublicMember({
      ...member,
      privacyConsent: {
        showPhoto: false,
        showLocation: false,
        showSocialProfiles: false,
        showBiography: false,
        showSkills: false,
        showTamilName: false,
        acceptedAt: new Date().toISOString(),
        version: '2026-01',
      },
    });
    expect(publicMember.photoURL).toBe('');
    expect(publicMember.parish).toBe('');
    expect(publicMember.instagram).toBe('');
    expect(publicMember.biographyDraft).toBe('');
    expect(publicMember.techSkills).toEqual([]);
    expect(publicMember.fullNameTa).toBe('');
  });
});

