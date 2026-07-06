// Madha TV participation module types.
// Admins publish programs; members register to participate; admins approve.

export type ProgramStatus = 'draft' | 'published' | 'archived';

export const PROGRAM_CATEGORIES = [
  'Shows',
  'Talks',
  'Live Worship',
  'Youth Programs',
  'Documentaries',
  'Music & Choir',
  'Feast Specials',
] as const;

export type ProgramCategory = (typeof PROGRAM_CATEGORIES)[number];

export interface MadhaTvProgram {
  id: string;
  title: string;
  description: string;
  category: ProgramCategory;
  thumbnailUrl?: string;
  videoUrl?: string;
  programDate?: string;
  participationOpen: boolean;
  status: ProgramStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export type ParticipantStatus = 'pending' | 'approved' | 'rejected';

export interface MadhaTvParticipant {
  id: string; // programId_uid: one registration per member per program
  programId: string;
  programTitle: string;
  memberUid: string;
  memberName: string;
  status: ParticipantStatus;
  registeredAt: string;
  reviewNote?: string;
}

export function participantIdFor(programId: string, uid: string): string {
  return `${programId}_${uid}`;
}

export interface ProgramFormValues {
  title: string;
  description: string;
  category: ProgramCategory;
  thumbnailUrl: string;
  videoUrl: string;
  programDate: string;
  participationOpen: boolean;
}

export const EMPTY_PROGRAM_FORM: ProgramFormValues = {
  title: '',
  description: '',
  category: 'Shows',
  thumbnailUrl: '',
  videoUrl: '',
  programDate: '',
  participationOpen: true,
};
