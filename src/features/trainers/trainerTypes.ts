// Trainer management module types.
// Flow: applicant submits (pending) -> admin approves (public trainer profile
// created) or rejects with a note. Approved trainers can be assigned courses.

export type TrainerApplicationStatus = 'pending' | 'approved' | 'rejected';
export type TrainerPreference = 'free' | 'paid' | 'both';

export interface TrainerApplication {
  id: string; // always the applicant's uid: one application per account
  applicantUid: string;
  fullName: string;
  email: string;
  mobile: string;
  qualification: string;
  skills: string[];
  teachingExperience: string;
  courseTopics: string[];
  bio: string;
  profileImageUrl?: string;
  sampleVideoUrl?: string;
  preference: TrainerPreference;
  availability: string;
  status: TrainerApplicationStatus;
  reviewNote?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

/** Public trainer profile, created by an admin when an application is approved. */
export interface Trainer {
  id: string; // same uid as the application
  fullName: string;
  qualification: string;
  skills: string[];
  courseTopics: string[];
  bio: string;
  profileImageUrl?: string;
  preference: TrainerPreference;
  active: boolean;
  approvedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainerApplicationFormValues {
  fullName: string;
  email: string;
  mobile: string;
  qualification: string;
  skillsText: string;
  teachingExperience: string;
  courseTopicsText: string;
  bio: string;
  profileImageUrl: string;
  sampleVideoUrl: string;
  preference: TrainerPreference;
  availability: string;
}

export const EMPTY_TRAINER_FORM: TrainerApplicationFormValues = {
  fullName: '',
  email: '',
  mobile: '',
  qualification: '',
  skillsText: '',
  teachingExperience: '',
  courseTopicsText: '',
  bio: '',
  profileImageUrl: '',
  sampleVideoUrl: '',
  preference: 'both',
  availability: '',
};
