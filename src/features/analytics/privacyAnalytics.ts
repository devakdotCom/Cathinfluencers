import type { Member } from '../../types';

export interface PrivacySafeMetric {
  label: string;
  count: number;
}

export function aggregateWithSuppression(
  members: Member[],
  selector: (member: Member) => string | undefined,
  minimumGroupSize = 5,
): PrivacySafeMetric[] {
  const counts = new Map<string, number>();
  for (const member of members) {
    const label = selector(member)?.trim();
    if (!label) continue;
    counts.set(label, (counts.get(label) || 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= minimumGroupSize)
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}
