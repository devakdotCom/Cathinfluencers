import type { Announcement, CalendarEvent, Member } from '../../types';

export type AssistantMode =
  | 'find_member'
  | 'biography'
  | 'announcement'
  | 'event'
  | 'ministry';

export interface AssistantDraft {
  title: string;
  content: string;
  publishAs?: 'member_biography' | 'announcement' | 'event';
  structuredContent?: Announcement | CalendarEvent;
}

const normalize = (value: string) => value.toLocaleLowerCase().trim();

export function findMatchingMembers(query: string, members: Member[]) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return members
    .map(member => {
      const profile = normalize(
        [
          member.fullName,
          member.parish,
          member.diocese,
          member.profession,
          member.roles,
          member.ambition,
          ...(member.techSkills || []),
          ...(member.softSkills || []),
        ].join(' '),
      );
      const score = terms.reduce(
        (total, term) => total + (profile.includes(term) ? 1 : 0),
        0,
      );
      return { member, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.member.fullName.localeCompare(b.member.fullName))
    .slice(0, 6)
    .map(result => result.member);
}

export function draftBiographyLocally(member: Member) {
  const skills = (member.techSkills || []).slice(0, 3).join(', ');
  const profession = member.profession
    ? `works as ${member.profession}`
    : 'serves through Catholic media ministry';
  const skillSentence = skills
    ? `Their ministry strengths include ${skills}.`
    : '';
  const ambition = member.ambition
    ? `They hope to ${member.ambition.replace(/[.!?]+$/, '')}.`
    : '';

  return `${member.fullName} is a member of ${member.parish || 'their local parish'} in ${member.diocese || 'the Catholic community'} and ${profession}. ${skillSentence} ${ambition} Through Vox Ecclesiae, they seek to collaborate responsibly, share the Gospel with clarity, and strengthen parish communication through faithful digital service.`
    .replace(/\s+/g, ' ')
    .trim();
}

export function suggestMinistries(member: Member | null, prompt: string) {
  const profile = normalize(
    [
      prompt,
      member?.profession,
      member?.ambition,
      ...(member?.techSkills || []),
      ...(member?.softSkills || []),
    ].join(' '),
  );
  const suggestions = [
    {
      keywords: ['video', 'editing', 'camera', 'photo'],
      value: 'Parish visual media and liturgical documentation',
    },
    {
      keywords: ['write', 'writing', 'journal', 'content'],
      value: 'Catholic editorial, testimony, and formation content',
    },
    {
      keywords: ['audio', 'music', 'podcast'],
      value: 'Faith podcasting, choir media, and audio production',
    },
    {
      keywords: ['design', 'graphic', 'canva'],
      value: 'Parish communications and Catholic visual design',
    },
    {
      keywords: ['web', 'developer', 'software', 'data'],
      value: 'Digital parish systems, websites, and responsible technology',
    },
    {
      keywords: ['youth', 'student', 'teach'],
      value: 'Youth formation and digital catechesis',
    },
  ]
    .filter(item => item.keywords.some(keyword => profile.includes(keyword)))
    .map(item => item.value);

  return suggestions.length
    ? suggestions.slice(0, 3)
    : [
        'Parish communications support',
        'Digital catechesis and faith formation',
        'Community storytelling and event coverage',
      ];
}

export function createAnnouncementDraft(
  prompt: string,
  author: string,
): AssistantDraft {
  const subject = prompt.trim() || 'Community ministry update';
  const announcement: Announcement = {
    id: crypto.randomUUID(),
    title: subject,
    content: `The Vox Ecclesiae community is invited to take note of ${subject.toLocaleLowerCase()}. Please review the official details, share this update responsibly within your parish network, and contact the ministry team if clarification is required.`,
    author,
    createdAt: new Date().toISOString(),
    priority: 'medium',
  };
  return {
    title: announcement.title,
    content: announcement.content,
    publishAs: 'announcement',
    structuredContent: announcement,
  };
}

export function createEventDraft(
  prompt: string,
  date: string,
): AssistantDraft {
  const title = prompt.trim() || 'Catholic media ministry gathering';
  const event: CalendarEvent = {
    id: crypto.randomUUID(),
    title,
    description: `A collaborative gathering focused on ${title.toLocaleLowerCase()}, parish coordination, shared learning, and practical next steps for Catholic digital ministry.`,
    date: date || new Date().toISOString().slice(0, 10),
    type: 'meeting',
    category: 'Media',
    location: 'To be confirmed',
  };
  return {
    title: event.title,
    content: event.description,
    publishAs: 'event',
    structuredContent: event,
  };
}

