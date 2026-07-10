import type { PublicSection } from '../features/search/GlobalSearch';

export interface PublicTabConfig {
  id: PublicSection;
  label: string;
  panelId: string;
}

/** Single source of truth for public portal tab labels and ARIA wiring. */
export const PUBLIC_TABS: PublicTabConfig[] = [
  { id: 'home', label: 'Portal Hub', panelId: 'pub-tab-lobby' },
  { id: 'directory', label: 'Our Leaders', panelId: 'pub-tab-leaders' },
  { id: 'courses', label: 'Courses', panelId: 'pub-tab-courses' },
  { id: 'excellence', label: 'Excellence', panelId: 'pub-tab-excellence' },
  { id: 'voxgroup', label: 'Vox Group', panelId: 'pub-tab-voxgroup' },
  { id: 'trainers', label: 'Trainers', panelId: 'pub-tab-trainers' },
  { id: 'madhatv', label: 'Madha TV', panelId: 'pub-tab-madhatv' },
  { id: 'announcements', label: 'Chronicles', panelId: 'pub-tab-announcements' },
  { id: 'events', label: 'Calendar & RSVP', panelId: 'pub-tab-events' },
  { id: 'resources', label: 'Catholic Connect', panelId: 'pub-tab-connect' },
  { id: 'guidelines', label: 'Resources', panelId: 'pub-tab-resources' },
];

export const PUBLIC_SECTION_PATHS: Record<string, PublicSection> = {
  '/courses': 'courses',
  '/our-leaders': 'directory',
  '/excellence': 'excellence',
  '/vox-group': 'voxgroup',
  '/trainers': 'trainers',
  '/madha-tv': 'madhatv',
  '/chronicles': 'announcements',
  '/calendar-rsvp': 'events',
  '/catholic-connect': 'resources',
  '/resources': 'guidelines',
};
