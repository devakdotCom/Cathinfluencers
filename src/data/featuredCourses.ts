export interface FeaturedCourse {
  id: string;
  tags: string[];
  pricing: 'free' | 'paid';
  title: string;
  description: string;
  duration: string;
  level: string;
  languages: string;
}

/** Curated CISCAF highlights shared by the marketing landing page and portal promos. */
export const FEATURED_COURSES: FeaturedCourse[] = [
  {
    id: 'digital-discipleship-101',
    tags: ['Faith Formation', 'free'],
    pricing: 'free',
    title: 'Digital Discipleship 101',
    description:
      'The cornerstone course. What the Church teaches about media and how to build a presence that flows from a real interior life.',
    duration: '6 weeks',
    level: 'Beginner',
    languages: 'EN · தமிழ்',
  },
  {
    id: 'catholic-apologetics-digital',
    tags: ['Catechism', 'free'],
    pricing: 'free',
    title: 'Catholic Apologetics for the Digital Era',
    description:
      'Defend and explain the faith online with clarity and charity, built for creators and writers.',
    duration: '8 weeks',
    level: 'Intermediate',
    languages: 'EN · தமிழ்',
  },
  {
    id: 'short-form-video-evangelization',
    tags: ['Media Ministry', 'paid'],
    pricing: 'paid',
    title: 'Short-Form Video Evangelization',
    description:
      'Reels and Shorts that catechize without losing depth. Scripting, filming, editing, publishing.',
    duration: '4 weeks',
    level: 'All levels',
    languages: 'EN',
  },
  {
    id: 'podcasting-as-ministry',
    tags: ['Communication', 'paid'],
    pricing: 'paid',
    title: 'Podcasting as Ministry',
    description:
      'Concept, gear, recording, and the pastoral art of long-form Catholic conversation.',
    duration: '6 weeks',
    level: 'Intermediate',
    languages: 'EN',
  },
  {
    id: 'mission-first-growth',
    tags: ['Youth Leadership', 'free'],
    pricing: 'free',
    title: 'Mission-First Growth Strategy',
    description:
      'Define your charism and audience, and build a content plan where every metric maps back to ministry.',
    duration: '5 weeks',
    level: 'Intermediate',
    languages: 'EN · தமிழ்',
  },
  {
    id: 'sacred-design-visual-identity',
    tags: ['Media Ministry', 'paid'],
    pricing: 'paid',
    title: 'Sacred Design & Visual Identity',
    description:
      'Typography, color, and iconography for feeds that feel reverent, consistent, and unmistakably yours.',
    duration: '4 weeks',
    level: 'All levels',
    languages: 'EN',
  },
];
