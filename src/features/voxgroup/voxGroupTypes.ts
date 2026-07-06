// Vox Group module types.
// The four pillars are fixed by the commission, so they are defined in code.
// Membership and activities live in Firestore.

export const VOX_GROUPS = [
  {
    id: 'adore',
    name: 'Adore',
    symbol: '✙',
    motto: 'Worship God and grow in love for Him.',
    description:
      'A community of prayer, adoration, and liturgical life. Members grow together through worship, devotions, and shared spiritual practice.',
  },
  {
    id: 'build',
    name: 'Build',
    symbol: '⌂',
    motto: 'Build faith and strong communities.',
    description:
      'Formation and community construction. Members strengthen parishes and digital spaces through catechesis, teaching, and encouragement.',
  },
  {
    id: 'connect',
    name: 'Connect',
    symbol: '∞',
    motto: 'Connect with people and serve together.',
    description:
      'Service and outreach. Members meet people where they are, collaborate across parishes, and put faith into action together.',
  },
  {
    id: 'disciple',
    name: 'Be His Disciple',
    symbol: '☩',
    motto: 'Live as disciples and make disciples.',
    description:
      'Discipleship and mission. Members commit to following Christ daily and forming the next generation of Catholic voices.',
  },
] as const;

export type VoxGroupId = (typeof VOX_GROUPS)[number]['id'];

export const VOX_GROUP_IDS: VoxGroupId[] = VOX_GROUPS.map(g => g.id);

export type GroupMembershipStatus = 'active' | 'left';

export interface VoxGroupMembership {
  id: string;
  groupId: VoxGroupId;
  memberUid: string;
  memberName: string;
  joinedAt: string;
  status: GroupMembershipStatus;
}

export function membershipIdFor(groupId: VoxGroupId, uid: string): string {
  return `${groupId}_${uid}`;
}

export type GroupActivityStatus = 'active' | 'archived';

export interface VoxGroupActivity {
  id: string;
  groupId: VoxGroupId;
  title: string;
  description: string;
  activityDate?: string;
  status: GroupActivityStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}
