import { apiFetch } from '../../services/apiClient';

export interface BiographyDraftInput {
  name: string;
  parish: string;
  diocese?: string;
  profession: string;
  ambition: string;
  ministry?: string;
  experience?: string;
  interests?: string;
  skills: string[];
}

export interface BiographyDrafts {
  short: string;
  professional: string;
  ministry: string;
  tamil: string;
  source: 'ai' | 'fallback';
}

export interface AIHealthMetrics {
  requests: number;
  successes: number;
  fallbacks: number;
  lastRequestAt?: string;
  lastProviderSuccessAt?: string;
}

const HEALTH_KEY = 'vox-ai-health-metrics';
let biographyQueue: Promise<unknown> = Promise.resolve();

export function getAIHealthMetrics(): AIHealthMetrics {
  try {
    return JSON.parse(window.localStorage.getItem(HEALTH_KEY) || '') as AIHealthMetrics;
  } catch {
    return { requests: 0, successes: 0, fallbacks: 0 };
  }
}

function recordHealth(providerSucceeded: boolean) {
  const current = getAIHealthMetrics();
  const now = new Date().toISOString();
  const next: AIHealthMetrics = {
    requests: current.requests + 1,
    successes: current.successes + (providerSucceeded ? 1 : 0),
    fallbacks: current.fallbacks + (providerSucceeded ? 0 : 1),
    lastRequestAt: now,
    lastProviderSuccessAt: providerSucceeded ? now : current.lastProviderSuccessAt,
  };
  window.localStorage.setItem(HEALTH_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('vox-ai-health-updated', { detail: next }));
}

export function createFallbackBiography(input: BiographyDraftInput): BiographyDrafts {
  const skills = input.skills.slice(0, 4).join(', ') || 'digital communication';
  const ministry = input.ministry || input.ambition || 'Catholic digital evangelization';
  const location = [input.parish, input.diocese].filter(Boolean).join(', ');
  const profession = input.profession || 'Catholic media collaborator';
  const experience = input.experience || 'service in parish and digital ministry initiatives';
  const interests = input.interests || skills;
  return {
    short: `${input.name} serves the Catholic community through ${ministry}${location ? ` in ${location}` : ''}, bringing experience in ${skills}.`,
    professional: `${input.name} is a ${profession} with experience in ${experience}. Their strengths include ${skills}, with a commitment to responsible, collaborative, and faith-centred communication.`,
    ministry: `${input.name} supports the mission of the Church through ${ministry}. Guided by prayer and service, they use ${skills} to strengthen parish communication, accompany communities, and share the Gospel with clarity and care.`,
    tamil: `${input.name} அவர்கள் ${location || 'தமது பங்கு சமூகத்தில்'} கத்தோலிக்கத் திருப்பணிக்காக சேவை செய்கிறார். ${ministry} வழியாக நற்செய்தியைப் பகிர்ந்து, ${interests} தொடர்பான திறன்களை திருச்சபை சமூகத்தின் வளர்ச்சிக்காகப் பயன்படுத்துகிறார்.`,
    source: 'fallback',
  };
}

async function requestProvider(input: BiographyDraftInput) {
  return apiFetch<{ success: true; drafts: Omit<BiographyDrafts, 'source'> }>(
    '/api/connect/draft-biography',
    { method: 'POST', body: JSON.stringify(input) },
  );
}

async function withRetry<T>(operation: () => Promise<T>, attempts = 2) {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await new Promise(resolve => window.setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export function draftBiography(input: BiographyDraftInput): Promise<BiographyDrafts> {
  const task = biographyQueue.then(async () => {
    try {
      const result = await withRetry(() => requestProvider(input));
      recordHealth(true);
      return { ...result.drafts, source: 'ai' as const };
    } catch (error) {
      console.warn('AI biography provider unavailable; local fallback used.', error);
      recordHealth(false);
      return createFallbackBiography(input);
    }
  });
  biographyQueue = task.catch(() => undefined);
  return task;
}
