import { getToken } from 'firebase/app-check';
import { appCheck, auth } from '../firebase';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

function apiUrl(path: string) {
  const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  return `${apiBase}${path}`;
}

/** True when a separate Express API is configured (Cloud Run / local dev server). */
export function isApiConfigured() {
  return Boolean((import.meta.env.VITE_API_BASE_URL || '').trim());
}

export async function publicApiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) {
    throw new ApiError(payload?.error || `Request failed with status ${response.status}.`, response.status);
  }
  return payload as T;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await auth?.currentUser?.getIdToken();
  if (!token) throw new ApiError('Please sign in to continue.', 401);
  const appCheckToken = appCheck ? (await getToken(appCheck)).token : null;

  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(appCheckToken ? { 'X-Firebase-AppCheck': appCheckToken } : {}),
      ...init.headers,
    },
  });

  const payload = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) {
    throw new ApiError(payload?.error || `Request failed with status ${response.status}.`, response.status);
  }

  return payload as T;
}
