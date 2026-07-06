import { describe, expect, it } from 'vitest';
import { getCuratedReflection } from '../src/features/reflections/dailyReflectionService';

describe('daily reflections', () => {
  it('rotates curated bilingual reflections by date', () => {
    const first = getCuratedReflection('2026-06-12');
    const second = getCuratedReflection('2026-06-13');
    expect(first.en.gospel).not.toBe(second.en.gospel);
    expect(first.ta.reflection).toMatch(/[\u0B80-\u0BFF]/);
    expect(first.date).toBe('2026-06-12');
  });
});
