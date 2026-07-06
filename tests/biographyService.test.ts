import { describe, expect, it } from 'vitest';
import { createFallbackBiography } from '../src/features/ai/biographyService';

describe('biography fallback', () => {
  it('creates four useful drafts without an AI provider', () => {
    const drafts = createFallbackBiography({
      name: 'Maria Joseph',
      parish: 'Santhome',
      diocese: 'Madras-Mylapore',
      profession: 'Designer',
      ambition: 'digital evangelization',
      ministry: 'youth ministry',
      experience: 'parish communications',
      interests: 'sacred art',
      skills: ['Design', 'Photography'],
    });
    expect(drafts.source).toBe('fallback');
    expect(drafts.short).toContain('Maria Joseph');
    expect(drafts.professional).toContain('Designer');
    expect(drafts.ministry).toContain('youth ministry');
    expect(drafts.tamil).toMatch(/[\u0B80-\u0BFF]/);
  });
});
