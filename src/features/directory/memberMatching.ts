import type { Member } from '../../types';

const normalizedSet = (values: string[]) =>
  new Set(values.map(value => value.toLocaleLowerCase().trim()).filter(Boolean));

export function getMemberMatch(
  viewer: Member | null,
  candidate: Member,
) {
  if (!viewer || viewer.id === candidate.id) {
    return { score: 0, reasons: [] as string[] };
  }
  const reasons: string[] = [];
  let score = 0;
  const viewerSkills = normalizedSet([
    ...(viewer.techSkills || []),
    ...(viewer.softSkills || []),
  ]);
  const candidateSkills = normalizedSet([
    ...(candidate.techSkills || []),
    ...(candidate.softSkills || []),
  ]);
  const sharedSkills = [...viewerSkills].filter(skill => candidateSkills.has(skill));
  if (sharedSkills.length) {
    score += Math.min(45, sharedSkills.length * 15);
    reasons.push(`Shared skills: ${sharedSkills.slice(0, 2).join(', ')}`);
  }
  if (viewer.diocese && viewer.diocese === candidate.diocese) {
    score += 25;
    reasons.push('Same diocese');
  }
  if (viewer.parish && viewer.parish === candidate.parish) {
    score += 20;
    reasons.push('Same parish');
  }
  const viewerGoals = normalizedSet(viewer.goals || []);
  const sharedGoals = (candidate.goals || []).filter(goal =>
    viewerGoals.has(goal.toLocaleLowerCase().trim()),
  );
  if (sharedGoals.length) {
    score += 10;
    reasons.push('Shared ministry goals');
  }
  return { score: Math.min(100, score), reasons };
}

