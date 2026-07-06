import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { parse } from 'csv-parse/sync';
import { memberSchema } from '../src/schemas/memberSchema';
import { toPublicMember } from '../src/utils/memberPrivacy';
import type { Member } from '../src/types';

const sourcePath = process.argv.find(argument => !argument.startsWith('--') && argument !== process.argv[0] && argument !== process.argv[1]);
const commit = process.argv.includes('--commit');

if (!sourcePath) {
  throw new Error('Usage: npm run migrate:members -- <members.json|members.csv> [--commit]');
}

if (getApps().length === 0) {
  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const absolutePath = path.resolve(sourcePath);
const content = await readFile(absolutePath, 'utf8');
const rows = absolutePath.toLowerCase().endsWith('.json')
  ? JSON.parse(content) as Record<string, unknown>[]
  : parse(content, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, unknown>[];

const firestore = getFirestore();
const validated: Member[] = [];
const failures: string[] = [];

for (const [index, row] of rows.entries()) {
  try {
    const email = String(row.email || row['Email Address'] || '').trim().toLowerCase();
    if (!email) throw new Error('Email is required to link Firebase Authentication ownership.');
    const user = await getAuth().getUserByEmail(email);
    const firstName = String(row.firstName || row['First Name'] || '').trim();
    const lastName = String(row.lastName || row['Last Name'] || '').trim();
    const candidate = {
      id: String(row.id || `CF-${crypto.randomUUID()}`),
      ownerUid: user.uid,
      firstName,
      lastName,
      fullName: String(row.fullName || `${firstName} ${lastName}`).trim(),
      email,
      phone: String(row.phone || ''),
      dob: String(row.dob || ''),
      gender: String(row.gender || ''),
      relationship: String(row.relationship || ''),
      bloodGroup: String(row.bloodGroup || ''),
      diocese: String(row.diocese || ''),
      parish: String(row.parish || ''),
      parishPriest: String(row.parishPriest || ''),
      country: String(row.country || 'India'),
      currentAddress: String(row.currentAddress || ''),
      permanentAddress: String(row.permanentAddress || ''),
      address: {
        street: String(row.street || ''),
        city: String(row.city || ''),
        state: String(row.state || ''),
        zipCode: String(row.zipCode || ''),
        country: String(row.country || 'India'),
      },
      membershipClass: row.membershipClass || 'Active',
      ambition: String(row.ambition || ''),
      hobbies: String(row.hobbies || ''),
      techSkills: Array.isArray(row.techSkills) ? row.techSkills : [],
      softSkills: Array.isArray(row.softSkills) ? row.softSkills : [],
      goals: Array.isArray(row.goals) ? row.goals : [],
      support: Array.isArray(row.support) ? row.support : [],
      pledgesAccepted: row.pledgesAccepted === true,
      joinedDate: String(row.joinedDate || new Date().toISOString().slice(0, 10)),
      status: row.status || 'Pending',
      avatarUrl: String(row.avatarUrl || 'bg-indigo-500'),
      notes: String(row.notes || ''),
      customFields: Array.isArray(row.customFields) ? row.customFields : [],
      lastActive: String(row.lastActive || new Date().toISOString()),
    };
    validated.push(memberSchema.parse(candidate) as Member);
  } catch (error) {
    failures.push(`Row ${index + 2}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(`Validated ${validated.length}/${rows.length} records.`);
if (failures.length) console.error(failures.join('\n'));
if (!commit) {
  console.log('Dry run complete. Re-run with --commit to write Firestore.');
  process.exitCode = failures.length ? 1 : 0;
} else {
  for (let index = 0; index < validated.length; index += 200) {
    const batch = firestore.batch();
    for (const member of validated.slice(index, index + 200)) {
      batch.set(firestore.collection('members').doc(member.id), member);
      batch.set(firestore.collection('publicMembers').doc(member.id), toPublicMember(member));
    }
    await batch.commit();
  }
  console.log(`Migrated ${validated.length} private/public member pairs.`);
}
