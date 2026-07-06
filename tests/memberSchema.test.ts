import { describe, expect, it } from 'vitest';
import { memberSchema } from '../src/schemas/memberSchema';

describe('member schema', () => {
  it('rejects an unowned private member record', () => {
    const result = memberSchema.safeParse({
      id: 'CF-1',
      fullName: 'Test Member',
      email: 'member@example.org',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email and oversized profile URLs', () => {
    const result = memberSchema.partial().safeParse({
      email: 'not-an-email',
      photoURL: `https://example.org/${'x'.repeat(3_000)}`,
    });
    expect(result.success).toBe(false);
  });
});
