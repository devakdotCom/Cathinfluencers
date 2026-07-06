import type { Member, ProfilePrivacyConsent } from '../types';

export const DEFAULT_PRIVACY_CONSENT: ProfilePrivacyConsent = {
  showPhoto: false,
  showLocation: true,
  showSocialProfiles: false,
  showBiography: true,
  showSkills: true,
  showTamilName: true,
  acceptedAt: '',
  version: '2026-01',
};

export function getPrivacyConsent(member: Member): ProfilePrivacyConsent {
  return {
    ...DEFAULT_PRIVACY_CONSENT,
    ...member.privacyConsent,
  };
}

export function toPublicMember(member: Member) {
  const consent = getPrivacyConsent(member);
  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    fullName: member.fullName,
    fullNameTa: consent.showTamilName ? member.fullNameTa || '' : '',
    preferredLanguage: member.preferredLanguage || 'en',
    diocese: consent.showLocation ? member.diocese : '',
    parish: consent.showLocation ? member.parish : '',
    country: consent.showLocation ? member.country : '',
    membershipClass: member.membershipClass,
    education: member.education || '',
    profession: member.profession || '',
    instagram: consent.showSocialProfiles ? member.instagram || '' : '',
    facebook: consent.showSocialProfiles ? member.facebook || '' : '',
    igPages: consent.showSocialProfiles ? member.igPages || '' : '',
    fbPages: consent.showSocialProfiles ? member.fbPages || '' : '',
    ytChannels: consent.showSocialProfiles ? member.ytChannels || '' : '',
    ambition: consent.showBiography ? member.ambition || '' : '',
    biographyDraft: consent.showBiography ? member.biographyDraft || '' : '',
    hobbies: consent.showBiography ? member.hobbies || '' : '',
    achievements: consent.showBiography ? member.achievements || '' : '',
    roles: consent.showBiography ? member.roles || '' : '',
    techSkills: consent.showSkills ? member.techSkills || [] : [],
    softSkills: consent.showSkills ? member.softSkills || [] : [],
    goals: consent.showSkills ? member.goals || [] : [],
    photoURL: consent.showPhoto ? member.photoURL || '' : '',
    joinedDate: member.joinedDate,
    status: member.status,
    avatarUrl: member.avatarUrl || '',
    lastActive: member.lastActive,
    privacyConsent: consent,
  };
}

