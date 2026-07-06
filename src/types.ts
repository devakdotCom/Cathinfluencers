export interface MemberAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CustomField {
  key: string;
  value: string;
}

export type MembershipClass = 'Active' | 'Guest' | 'VIP' | 'Staff' | 'Alumnus' | 'Director' | 'Seminarian' | 'Student';
export type MemberStatus = 'Pending' | 'Affiliated' | 'Abdicated' | 'Director' | 'Inactive' | 'Active' | 'Suspended' | 'ID card to be provided' | 'Data Insufficient';

export interface Member {
  id: string; // e.g. "CF-250102"
  ownerUid?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  fullNameTa?: string;
  preferredLanguage?: 'en' | 'ta';
  email: string;
  phone: string;
  dob: string;
  gender: string;
  relationship: string; // Unmarried, Married, Celibate
  bloodGroup: string;
  diocese: string;
  parish: string;
  parishPriest: string;
  country: string;
  currentAddress: string;
  permanentAddress?: string;
  address: MemberAddress; // Ensures compatibility with Import & Export
  membershipClass: MembershipClass; // Required by directory filters
  education?: string;
  profession?: string;
  instagram?: string;
  facebook?: string;
  igPages?: string;
  fbPages?: string;
  ytChannels?: string;
  ambition: string;
  biographyDraft?: string;
  biographyDrafts?: {
    short: string;
    professional: string;
    ministry: string;
    tamil: string;
  };
  hobbies: string;
  fiveYears?: string;
  achievements?: string;
  ideas?: string;
  roles?: string;
  bibleBook?: string;
  bibleChapter?: string;
  bibleVerse?: string;
  bibleVerseText?: string;
  bibleVerseWhy?: string;
  techSkills: string[];
  softSkills: string[];
  goals: string[];
  support: string[];
  frequency?: string;
  mode?: string;
  photoURL?: string;
  pledgesAccepted: boolean;
  joinedDate: string;
  status: MemberStatus;
  avatarUrl: string;
  notes: string;
  customFields: CustomField[];
  lastActive: string;
  voxUserId?: string;
  privacyConsent?: ProfilePrivacyConsent;
}

export interface ProfilePrivacyConsent {
  showPhoto: boolean;
  showLocation: boolean;
  showSocialProfiles: boolean;
  showBiography: boolean;
  showSkills: boolean;
  showTamilName: boolean;
  acceptedAt: string;
  version: '2026-01';
}

export interface AdminProfile {
  id: string;
  uid?: string;
  name: string;
  email: string;
  voxId: string;
  addedAt: string;
}

export interface QueryFilters {
  searchQuery: string;
  statuses: MemberStatus[];
  membershipClasses: MembershipClass[];
  diocese: string;
  parish: string;
  gender: string;
  sortBy: 'name-asc' | 'name-desc' | 'joined-newest' | 'joined-oldest' | 'status-asc';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  memberId: string;
  memberName: string;
  details: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  type: 'meeting' | 'holyday' | 'feast' | 'other';
  category: 'Clergy' | 'General' | 'Media' | 'Youth' | 'Liturgical';
  location?: string;
  link?: string;
}

export type ApprovalKind =
  | 'member_create'
  | 'member_update'
  | 'announcement'
  | 'event'
  | 'ai_content';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export interface ApprovalRequest {
  id: string;
  kind: ApprovalKind;
  status: ApprovalStatus;
  title: string;
  summary: string;
  ownerUid: string;
  ownerName: string;
  targetId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
  sourceCollection?: 'approvalRequests' | 'memberChangeRequests';
}

export type NotificationType =
  | 'approval'
  | 'event'
  | 'announcement'
  | 'profile'
  | 'system';

export interface AppNotification {
  id: string;
  recipientUid: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  readAt?: string;
  actionTarget?: string;
}

export interface PublicCredential {
  id: string;
  displayName: string;
  displayNameTa?: string;
  status: string;
  diocese: string;
  issuedAt: string;
  expiresAt: string;
  revokedAt?: string;
}
