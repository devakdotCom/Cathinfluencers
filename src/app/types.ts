import type { PublicSection } from '../features/search/GlobalSearch';

export type PortalMode =
  | 'welcome'
  | 'member-form'
  | 'member-tracker'
  | 'admin'
  | 'directory'
  | 'analytics'
  | 'import-export'
  | 'audit-logs';

export type AdminTab =
  | 'dashboard'
  | 'directory'
  | 'courses'
  | 'excellence'
  | 'voxgroup'
  | 'trainers'
  | 'madhatv'
  | 'campaigns'
  | 'reports'
  | 'analytics'
  | 'import-export'
  | 'audit-logs'
  | 'admins'
  | 'profile';

export type AuthMode = 'sign-in' | 'register' | 'reset';

export type ApostolateGroup = 'all' | 'clerics' | 'media-tech' | 'youth' | 'active';

export type DirectoryViewStyle = 'bento' | 'canonical-table';

export interface PortalInitProps {
  initialPortalMode?: PortalMode;
  initialAuthMode?: AuthMode;
  initialPublicSection?: PublicSection;
}
