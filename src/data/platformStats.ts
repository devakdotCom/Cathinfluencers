/** Fallback registry metrics when the public stats API is unreachable. */
export const PLATFORM_STATS_FALLBACK = {
  memberCount: 0,
  courseCount: 0,
  liveSessionCount: 12,
  languageCount: 2,
  updatedAt: '',
} as const;

export interface PlatformStats {
  memberCount: number;
  courseCount: number;
  liveSessionCount: number;
  languageCount: number;
  updatedAt: string;
}
