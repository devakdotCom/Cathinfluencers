import fs from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let environment: RulesTestEnvironment;

const now = new Date().toISOString();

const draftCourse = {
  id: 'course-1',
  title: 'Digital Discipleship 101',
  category: 'Faith Formation',
  description: 'Cornerstone formation course.',
  type: 'free',
  priceInr: 0,
  durationWeeks: 6,
  level: 'Beginner',
  language: 'English',
  trainerName: '',
  syllabus: [],
  outcomes: [],
  certificateAvailable: true,
  status: 'draft',
  createdAt: now,
  updatedAt: now,
  createdBy: 'admin-1',
  updatedBy: 'admin-1',
};

function enrollmentFor(courseId: string, uid: string, name = 'Member One') {
  return {
    id: `${courseId}_${uid}`,
    courseId,
    courseTitle: 'Digital Discipleship 101',
    memberUid: uid,
    memberName: name,
    enrolledAt: now,
    status: 'active',
    paymentStatus: 'not_required',
    paymentAmountInr: 0,
  };
}

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'vox-ecclesiae-modules-test',
    firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') },
  });
});

beforeEach(async () => environment.clearFirestore());
afterAll(async () => environment.cleanup());

const admin = () => environment.authenticatedContext('admin-1', { admin: true }).firestore();
const moderator = () => environment.authenticatedContext('mod-1', { moderator: true }).firestore();
const member = (uid = 'member-1') => environment.authenticatedContext(uid).firestore();
const anonymous = () => environment.unauthenticatedContext().firestore();

async function seed(path: string, data: Record<string, unknown>) {
  await environment.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), path), data);
  });
}

describe('Courses: save, publish, read, delete', () => {
  it('lets admins manage the full course lifecycle while blocking everyone else', async () => {
    // Admin saves a draft.
    await assertSucceeds(setDoc(doc(admin(), 'courses/course-1'), draftCourse));
    // Members and anonymous users cannot write courses.
    await assertFails(setDoc(doc(member(), 'courses/course-2'), { ...draftCourse, id: 'course-2' }));
    await assertFails(setDoc(doc(anonymous(), 'courses/course-3'), { ...draftCourse, id: 'course-3' }));
    // Drafts are invisible to the public but visible to admins.
    await assertFails(getDoc(doc(anonymous(), 'courses/course-1')));
    await assertSucceeds(getDoc(doc(admin(), 'courses/course-1')));
    // Admin publishes; the public can now read it.
    await assertSucceeds(updateDoc(doc(admin(), 'courses/course-1'), {
      status: 'published', updatedAt: now, updatedBy: 'admin-1',
    }));
    await assertSucceeds(getDoc(doc(anonymous(), 'courses/course-1')));
    // Members cannot delete; admins can.
    await assertFails(deleteDoc(doc(member(), 'courses/course-1')));
    await assertSucceeds(deleteDoc(doc(admin(), 'courses/course-1')));
  });
});

describe('Enrollments: free enrollment, cancellation, roster privacy', () => {
  it('allows self-enrollment into free published courses only', async () => {
    await seed('courses/course-1', { ...draftCourse, status: 'published' });
    // Correct deterministic id, own uid: allowed.
    await assertSucceeds(
      setDoc(doc(member(), 'enrollments/course-1_member-1'), enrollmentFor('course-1', 'member-1')),
    );
    // Wrong document id: denied.
    await assertFails(
      setDoc(doc(member('member-2'), 'enrollments/whatever'), enrollmentFor('course-1', 'member-2')),
    );
    // Enrolling somebody else: denied.
    await assertFails(
      setDoc(doc(member('member-3'), 'enrollments/course-1_member-9'), enrollmentFor('course-1', 'member-9')),
    );
  });

  it('blocks paid and unpublished courses from client-side enrollment', async () => {
    await seed('courses/paid-1', { ...draftCourse, id: 'paid-1', type: 'paid', priceInr: 500, status: 'published' });
    await seed('courses/draft-1', { ...draftCourse, id: 'draft-1', status: 'draft' });
    await assertFails(
      setDoc(doc(member(), 'enrollments/paid-1_member-1'), enrollmentFor('paid-1', 'member-1')),
    );
    await assertFails(
      setDoc(doc(member(), 'enrollments/draft-1_member-1'), enrollmentFor('draft-1', 'member-1')),
    );
  });

  it('lets owners cancel but not tamper, keeps rosters private, admin deletes', async () => {
    await seed('courses/course-1', { ...draftCourse, status: 'published' });
    await seed('enrollments/course-1_member-1', enrollmentFor('course-1', 'member-1'));
    // Owner reads own enrollment; stranger cannot.
    await assertSucceeds(getDoc(doc(member(), 'enrollments/course-1_member-1')));
    await assertFails(getDoc(doc(member('member-2'), 'enrollments/course-1_member-1')));
    // Owner cancels (status only) but cannot flip payment fields.
    await assertSucceeds(updateDoc(doc(member(), 'enrollments/course-1_member-1'), { status: 'cancelled' }));
    await assertFails(updateDoc(doc(member(), 'enrollments/course-1_member-1'), { paymentStatus: 'paid' }));
    // Admin read and delete.
    await assertSucceeds(getDoc(doc(admin(), 'enrollments/course-1_member-1')));
    await assertSucceeds(deleteDoc(doc(admin(), 'enrollments/course-1_member-1')));
  });

  it('lets an assigned trainer read the roster of their own course only', async () => {
    await seed('courses/course-1', { ...draftCourse, status: 'published', trainerUid: 'trainer-1' });
    await seed('enrollments/course-1_member-1', enrollmentFor('course-1', 'member-1'));
    await assertSucceeds(getDoc(doc(member('trainer-1'), 'enrollments/course-1_member-1')));
    await assertFails(getDoc(doc(member('trainer-2'), 'enrollments/course-1_member-1')));
  });
});

describe('Achievements: submission, review workflow, public wall', () => {
  const submission = {
    id: 'ach-1',
    title: 'First Evangelization Reel',
    memberName: 'Member One',
    memberUid: 'member-1',
    category: 'Media Creation',
    description: 'Published a catechesis reel that reached the parish youth.',
    achievedOn: '2026-07-01',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    createdBy: 'member-1',
    updatedBy: 'member-1',
  };

  it('members submit pending items and can never publish themselves', async () => {
    await assertSucceeds(setDoc(doc(member(), 'achievements/ach-1'), submission));
    // Direct publish on create: denied.
    await assertFails(setDoc(doc(member(), 'achievements/ach-2'), { ...submission, id: 'ach-2', status: 'published' }));
    // Self-promotion via update: denied.
    await assertFails(updateDoc(doc(member(), 'achievements/ach-1'), { status: 'published' }));
    // Owner sees own pending item; the public does not.
    await assertSucceeds(getDoc(doc(member(), 'achievements/ach-1')));
    await assertFails(getDoc(doc(anonymous(), 'achievements/ach-1')));
  });

  it('reviewers approve and publish; the wall becomes public; admin deletes', async () => {
    await seed('achievements/ach-1', submission);
    await assertSucceeds(updateDoc(doc(moderator(), 'achievements/ach-1'), {
      status: 'approved', updatedAt: now, updatedBy: 'mod-1', approvedBy: 'mod-1',
    }));
    await assertSucceeds(updateDoc(doc(moderator(), 'achievements/ach-1'), {
      status: 'published', publishedAt: now, updatedAt: now, updatedBy: 'mod-1', approvedBy: 'mod-1',
    }));
    await assertSucceeds(getDoc(doc(anonymous(), 'achievements/ach-1')));
    // Reviewer cannot reassign the achievement to another member.
    await assertFails(updateDoc(doc(moderator(), 'achievements/ach-1'), { memberUid: 'someone-else' }));
    await assertFails(deleteDoc(doc(moderator(), 'achievements/ach-1')));
    await assertSucceeds(deleteDoc(doc(admin(), 'achievements/ach-1')));
  });
});

describe('Vox Group: joining, leaving, privacy', () => {
  const membership = {
    id: 'adore_member-1',
    groupId: 'adore',
    memberUid: 'member-1',
    memberName: 'Member One',
    joinedAt: now,
    status: 'active',
  };

  it('members join pillars as themselves with duplicate-proof ids', async () => {
    await assertSucceeds(setDoc(doc(member(), 'voxGroupMembers/adore_member-1'), membership));
    // Unknown pillar: denied.
    await assertFails(setDoc(doc(member(), 'voxGroupMembers/choir_member-1'), {
      ...membership, id: 'choir_member-1', groupId: 'choir',
    }));
    // Joining on behalf of someone else: denied.
    await assertFails(setDoc(doc(member('member-2'), 'voxGroupMembers/adore_member-9'), {
      ...membership, id: 'adore_member-9', memberUid: 'member-9',
    }));
  });

  it('membership lists are signed-in only; owners toggle status only', async () => {
    await seed('voxGroupMembers/adore_member-1', membership);
    await assertFails(getDoc(doc(anonymous(), 'voxGroupMembers/adore_member-1')));
    await assertSucceeds(getDoc(doc(member('member-2'), 'voxGroupMembers/adore_member-1')));
    await assertSucceeds(updateDoc(doc(member(), 'voxGroupMembers/adore_member-1'), { status: 'left' }));
    await assertFails(updateDoc(doc(member(), 'voxGroupMembers/adore_member-1'), { memberName: 'Renamed' }));
    await assertSucceeds(deleteDoc(doc(admin(), 'voxGroupMembers/adore_member-1')));
  });

  it('activities are public reads but reviewer-managed', async () => {
    const activity = {
      id: 'act-1', groupId: 'build', title: 'Community build day',
      description: 'Hands-on parish service.', status: 'active',
      createdAt: now, createdBy: 'mod-1', updatedAt: now, updatedBy: 'mod-1',
    };
    await assertFails(setDoc(doc(member(), 'voxGroupActivities/act-1'), activity));
    await assertSucceeds(setDoc(doc(moderator(), 'voxGroupActivities/act-1'), activity));
    await assertSucceeds(getDoc(doc(anonymous(), 'voxGroupActivities/act-1')));
    await assertSucceeds(deleteDoc(doc(admin(), 'voxGroupActivities/act-1')));
  });
});

describe('Trainers: application review without self-approval', () => {
  const application = {
    id: 'applicant-1',
    applicantUid: 'applicant-1',
    fullName: 'Trainer Applicant',
    email: 'applicant@example.org',
    mobile: '',
    qualification: 'M.A. Theology',
    skills: ['Apologetics'],
    teachingExperience: '',
    courseTopics: ['Catechism'],
    bio: 'Experienced parish catechist and communicator.',
    preference: 'both',
    availability: 'Weekends',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  it('applicants file once as themselves and cannot approve themselves', async () => {
    await assertSucceeds(setDoc(doc(member('applicant-1'), 'trainerApplications/applicant-1'), application));
    // Filing under a different document id: denied.
    await assertFails(setDoc(doc(member('applicant-2'), 'trainerApplications/someone-else'), {
      ...application, id: 'someone-else', applicantUid: 'applicant-2',
    }));
    // Self-approval: denied (owner updates must stay pending).
    await assertFails(updateDoc(doc(member('applicant-1'), 'trainerApplications/applicant-1'), { status: 'approved' }));
    // Reviewer approves.
    await assertSucceeds(updateDoc(doc(moderator(), 'trainerApplications/applicant-1'), {
      status: 'approved', reviewedBy: 'mod-1', updatedAt: now,
    }));
    // Applicant reads own; strangers do not.
    await assertSucceeds(getDoc(doc(member('applicant-1'), 'trainerApplications/applicant-1')));
    await assertFails(getDoc(doc(member('member-2'), 'trainerApplications/applicant-1')));
  });

  it('trainer profiles are public reads, admin writes', async () => {
    const trainer = {
      id: 'applicant-1', fullName: 'Trainer Applicant', qualification: 'M.A. Theology',
      skills: [], courseTopics: [], bio: 'Bio', preference: 'both', active: true,
      approvedBy: 'admin-1', createdAt: now, updatedAt: now,
    };
    await assertFails(setDoc(doc(member(), 'trainers/applicant-1'), trainer));
    await assertSucceeds(setDoc(doc(admin(), 'trainers/applicant-1'), trainer));
    await assertSucceeds(getDoc(doc(anonymous(), 'trainers/applicant-1')));
  });
});

describe('Madha TV: programs and participation approval', () => {
  const program = {
    id: 'prog-1',
    title: 'Youth Talk Night',
    description: 'A live youth participation program.',
    category: 'Youth Programs',
    participationOpen: true,
    status: 'published',
    createdAt: now,
    updatedAt: now,
    createdBy: 'mod-1',
    updatedBy: 'mod-1',
  };

  it('reviewers manage programs; the public sees only published ones', async () => {
    await assertFails(setDoc(doc(member(), 'madhaTvPrograms/prog-1'), program));
    await assertSucceeds(setDoc(doc(moderator(), 'madhaTvPrograms/prog-1'), { ...program, status: 'draft' }));
    await assertFails(getDoc(doc(anonymous(), 'madhaTvPrograms/prog-1')));
    await assertSucceeds(updateDoc(doc(moderator(), 'madhaTvPrograms/prog-1'), { status: 'published', updatedAt: now, updatedBy: 'mod-1' }));
    await assertSucceeds(getDoc(doc(anonymous(), 'madhaTvPrograms/prog-1')));
  });

  it('members register only for open published programs and never approve themselves', async () => {
    await seed('madhaTvPrograms/prog-1', program);
    await seed('madhaTvPrograms/closed-1', { ...program, id: 'closed-1', participationOpen: false });
    const registration = {
      id: 'prog-1_member-1', programId: 'prog-1', programTitle: 'Youth Talk Night',
      memberUid: 'member-1', memberName: 'Member One', status: 'pending', registeredAt: now,
    };
    await assertSucceeds(setDoc(doc(member(), 'madhaTvParticipants/prog-1_member-1'), registration));
    await assertFails(setDoc(doc(member(), 'madhaTvParticipants/closed-1_member-1'), {
      ...registration, id: 'closed-1_member-1', programId: 'closed-1',
    }));
    await assertFails(updateDoc(doc(member(), 'madhaTvParticipants/prog-1_member-1'), { status: 'approved' }));
    await assertSucceeds(updateDoc(doc(moderator(), 'madhaTvParticipants/prog-1_member-1'), { status: 'approved' }));
    await assertFails(getDoc(doc(member('member-2'), 'madhaTvParticipants/prog-1_member-1')));
    await assertSucceeds(getDoc(doc(member(), 'madhaTvParticipants/prog-1_member-1')));
  });
});

describe('Campaigns: internal to reviewers only', () => {
  const campaign = {
    id: 'cmp-1', title: 'Course launch', type: 'Course announcement',
    audience: 'All members', message: 'New CISCAF course opens next week.',
    status: 'draft', createdAt: now, updatedAt: now, createdBy: 'admin-1', updatedBy: 'admin-1',
  };

  it('members can neither read nor write campaigns; admins can manage them', async () => {
    await assertSucceeds(setDoc(doc(admin(), 'campaigns/cmp-1'), campaign));
    await assertFails(setDoc(doc(member(), 'campaigns/cmp-2'), { ...campaign, id: 'cmp-2' }));
    await assertFails(getDoc(doc(member(), 'campaigns/cmp-1')));
    await assertFails(getDoc(doc(anonymous(), 'campaigns/cmp-1')));
    await assertSucceeds(getDoc(doc(moderator(), 'campaigns/cmp-1')));
    await assertSucceeds(deleteDoc(doc(admin(), 'campaigns/cmp-1')));
  });
});
