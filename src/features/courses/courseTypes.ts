// CISCAF course module types.
// Payment-ready model: paid courses carry price data now; Razorpay fields
// activate when payment keys are configured (Phase: payments).

export type CourseType = 'free' | 'paid';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All levels';

export const COURSE_CATEGORIES = [
  'Catechism',
  'Faith Formation',
  'AI Skills',
  'Trending Skills',
  'Communication',
  'Media Ministry',
  'Youth Leadership',
  'Bible Study',
  'Teacher Training',
  'Church Leadership',
] as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  description: string;
  imageUrl?: string;
  type: CourseType;
  priceInr: number;
  durationWeeks: number;
  level: CourseLevel;
  language: string;
  trainerName: string;
  trainerUid?: string;
  startDate?: string;
  endDate?: string;
  syllabus: string[];
  outcomes: string[];
  certificateAvailable: boolean;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export type EnrollmentPaymentStatus = 'not_required' | 'pending' | 'paid' | 'failed';
export type EnrollmentStatus = 'active' | 'completed' | 'cancelled';

export interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  memberUid: string;
  memberName: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  paymentStatus: EnrollmentPaymentStatus;
  paymentAmountInr: number;
  // Razorpay fields, populated by the payment phase (server-verified only).
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export function enrollmentIdFor(courseId: string, uid: string): string {
  return `${courseId}_${uid}`;
}

export interface CourseFormValues {
  title: string;
  category: CourseCategory;
  description: string;
  imageUrl: string;
  type: CourseType;
  priceInr: number;
  durationWeeks: number;
  level: CourseLevel;
  language: string;
  trainerName: string;
  startDate: string;
  endDate: string;
  syllabusText: string;
  outcomesText: string;
  certificateAvailable: boolean;
}

export const EMPTY_COURSE_FORM: CourseFormValues = {
  title: '',
  category: 'Faith Formation',
  description: '',
  imageUrl: '',
  type: 'free',
  priceInr: 0,
  durationWeeks: 4,
  level: 'All levels',
  language: 'English',
  trainerName: '',
  startDate: '',
  endDate: '',
  syllabusText: '',
  outcomesText: '',
  certificateAvailable: true,
};
