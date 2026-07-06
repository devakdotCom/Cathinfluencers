import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const args = process.argv.slice(2);
const valueAfter = (flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};
const uid = valueAfter('--uid');
const email = valueAfter('--email');
const serviceAccountPath = valueAfter('--service-account');
const adminValue = valueAfter('--admin') ?? 'true';
if ((!uid && !email) || (uid && email) || !['true', 'false'].includes(adminValue)) {
  throw new Error(
    'Usage: npm run admin:set-role -- --email user@example.org --admin true|false '
    + '--service-account C:\\secure\\firebase-admin.json\n'
    + '   or: npm run admin:set-role -- --uid FIREBASE_UID --admin true|false '
    + '--service-account C:\\secure\\firebase-admin.json',
  );
}
const enabled = adminValue === 'true';

function projectIdFromFirebaseRc() {
  try {
    const firebaseRc = JSON.parse(readFileSync(path.resolve('.firebaserc'), 'utf8')) as {
      projects?: Record<string, string>;
    };
    return firebaseRc.projects?.prod || firebaseRc.projects?.Prod || firebaseRc.projects?.default;
  } catch {
    return undefined;
  }
}

const projectId = process.env.FIREBASE_PROJECT_ID
  || process.env.VITE_FIREBASE_PROJECT_ID
  || projectIdFromFirebaseRc();

if (!projectId) {
  throw new Error(
    'Firebase project ID is missing. Set FIREBASE_PROJECT_ID or configure .firebaserc.',
  );
}

if (getApps().length === 0) {
  let credential = applicationDefault();
  if (serviceAccountPath) {
    const absolutePath = path.resolve(serviceAccountPath);
    const serviceAccount = JSON.parse(readFileSync(absolutePath, 'utf8')) as ServiceAccount;
    credential = cert(serviceAccount);
  }
  initializeApp({
    credential,
    projectId,
  });
}

try {
  const user = uid ? await getAuth().getUser(uid) : await getAuth().getUserByEmail(email!);
  await getAuth().setCustomUserClaims(user.uid, {
    ...user.customClaims,
    admin: enabled,
  });
  console.log(
    `${enabled ? 'Granted' : 'Revoked'} admin claim for ${user.email || user.uid} `
    + `in project ${projectId}. The user must sign out and sign in again.`,
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (
    /credential|authentication|default credentials|private key|unauthorized|project id/i.test(message)
  ) {
    throw new Error(
      'Firebase Admin credentials are unavailable or invalid. Download a private key from '
      + 'Firebase Console > Project settings > Service accounts, keep it outside this repository, '
      + 'then pass --service-account C:\\path\\to\\firebase-admin.json.',
      { cause: error },
    );
  }
  throw error;
}
