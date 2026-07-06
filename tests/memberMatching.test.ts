import { describe, expect, it } from 'vitest';
import { getMemberMatch } from '../src/features/directory/memberMatching';
import type { Member } from '../src/types';

const base = {
  id: 'one',
  diocese: 'Madras-Mylapore',
  parish: 'Santhome',
  techSkills: ['Video Editing', 'Photography'],
  softSkills: ['Teamwork'],
  goals: ['Youth Ministry'],
} as Member;

describe('member matching', () => {
  it('explains shared skills and geography', () => {
    const result = getMemberMatch(base, {
      ...base,
      id: 'two',
      techSkills: ['Video Editing'],
      softSkills: ['Teamwork'],
    });
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.reasons).toContain('Same diocese');
    expect(result.reasons.some(reason => reason.startsWith('Shared skills'))).toBe(true);
  });

  it('does not recommend the same profile to itself', () => {
    expect(getMemberMatch(base, base)).toEqual({ score: 0, reasons: [] });
  });
});

