// Vox Excellence achievement module types.
// Workflow: member submits (pending) -> admin approves -> admin publishes.
// Only published achievements are publicly visible; rules enforce this.

export type AchievementStatus = 'pending' | 'approved' | 'published' | 'rejected';

export const ACHIEVEMENT_CATEGORIES = [
  'Evangelization',
  'Media Creation',
  'Community Service',
  'Academic Excellence',
  'Youth Leadership',
  'Ministry Milestone',
  'Special Recognition',
] as const;

export type AchievementCategory = (typeof ACHIEVEMENT_CATEGORIES)[number];

export interface Achievement {
  id: string;
  title: string;
  memberName: string;
  memberUid: string;
  category: AchievementCategory;
  description: string;
  imageUrl?: string;
  proofUrl?: string;
  achievedOn: string;
  parish?: string;
  status: AchievementStatus;
  reviewNote?: string;
  approvedBy?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface AchievementFormValues {
  title: string;
  memberName: string;
  category: AchievementCategory;
  description: string;
  imageUrl: string;
  proofUrl: string;
  achievedOn: string;
  parish: string;
}

export const EMPTY_ACHIEVEMENT_FORM: AchievementFormValues = {
  title: '',
  memberName: '',
  category: 'Evangelization',
  description: '',
  imageUrl: '',
  proofUrl: '',
  achievedOn: '',
  parish: '',
};
