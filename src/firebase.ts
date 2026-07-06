import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from 'firebase/app-check';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  initializeFirestore,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import type { AdminProfile, Announcement, CalendarEvent } from './types';

interface FirebaseConnectionConfig extends FirebaseOptions {
  databaseId?: string;
}

function readFirebaseConfig(): FirebaseConnectionConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) return null;

  return {
    apiKey,
    projectId,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    databaseId: import.meta.env.VITE_FIRESTORE_DATABASE_ID || undefined,
  };
}

const config = readFirebaseConfig();
export const hasActiveFirebase = config !== null;

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let appCheckInstance: AppCheck | null = null;

if (config) {
  appInstance = getApps().length ? getApp() : initializeApp(config);
  dbInstance = config.databaseId
    ? initializeFirestore(appInstance, {}, config.databaseId)
    : getFirestore(appInstance);
  authInstance = getAuth(appInstance);
  const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY;
  if (appCheckSiteKey && typeof window !== 'undefined') {
    appCheckInstance = initializeAppCheck(appInstance, {
      provider: new ReCaptchaV3Provider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  }
}

export const app = appInstance;
export const db = dbInstance;
export const auth = authInstance;
export const appCheck = appCheckInstance;

function reportFirestoreError(error: unknown, path: string): never {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Firestore operation failed at ${path}:`, error);
  if (/quota|resource-exhausted/i.test(message)) {
    window.dispatchEvent(new CustomEvent('firebase-quota-exceeded'));
  }
  throw error instanceof Error ? error : new Error(message);
}

async function saveDocument<T extends object>(collectionName: string, id: string, value: T) {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    await setDoc(doc(db, collectionName, id), value);
  } catch (error) {
    reportFirestoreError(error, `${collectionName}/${id}`);
  }
}

async function deleteDocument(collectionName: string, id: string) {
  if (!db) throw new Error('Firestore is not configured.');
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    reportFirestoreError(error, `${collectionName}/${id}`);
  }
}

export function saveAdminProfile(admin: AdminProfile) {
  return saveDocument('adminProfiles', admin.uid || admin.id, admin);
}

export function deleteAdminProfile(adminId: string) {
  return deleteDocument('adminProfiles', adminId);
}

export function saveAnnouncement(announcement: Announcement) {
  return saveDocument('announcements', announcement.id, announcement);
}

export function deleteAnnouncement(announcementId: string) {
  return deleteDocument('announcements', announcementId);
}

export function saveCalendarEvent(event: CalendarEvent) {
  return saveDocument('calendarEvents', event.id, event);
}

export function deleteCalendarEvent(eventId: string) {
  return deleteDocument('calendarEvents', eventId);
}

export async function downloadLeaderPortraits(): Promise<Record<string, string>> {
  if (!db) return {};
  try {
    const snapshot = await getDocs(collection(db, 'leaders'));
    return Object.fromEntries(
      snapshot.docs
        .map(item => item.data() as { id?: string; image?: string })
        .filter(item => item.id && item.image)
        .map(item => [item.id!, item.image!]),
    );
  } catch (error) {
    console.error('Failed to load public leader portraits:', error);
    return {};
  }
}
