# Vox Ecclesiae Member Directory

Production-oriented React, Firebase, and Node.js directory for Catholic media ministry members, events, credentials, and administrative review.

## Architecture

- React 19 + Vite with route-level and feature-level lazy loading.
- Firebase Authentication for member sessions and `admin=true` custom claims.
- Firestore split into public projections (`publicMembers`) and private profiles (`members`).
- Cloudinary's free plan for optional profile-image uploads and CDN delivery.
- An optional Express API for AI, signed credentials, audit logs, and privileged workflows.
- Firebase Hosting serves the SPA without requiring Firebase Storage or Cloud Run.

The browser never receives service-account credentials or the Gemini API key. Member updates enter `memberChangeRequests` and require administrator approval.

## Local Development

Requirements: Node.js 20+, npm, and Java 21 for Firebase Emulator tests.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Set the Firebase web configuration in `.env.local`. For local server authentication, use Application Default Credentials or set `GOOGLE_APPLICATION_CREDENTIALS` to a service-account file outside the repository.

## Free Image Hosting

Firebase Storage is deliberately not used. To enable profile-image uploads:

1. Create a free Cloudinary account.
2. Open **Settings > Upload > Upload presets**.
3. Create an **Unsigned** preset such as `vox-profile-images`.
4. In that preset, restrict formats to `jpg`, `jpeg`, `png`, and `webp`.
5. Set the maximum file size to 2 MB and use a dedicated folder such as `vox/profile-images`.
6. Add the following values to `.env.local`:

```dotenv
VITE_CLOUDINARY_CLOUD_NAME="your-cloud-name"
VITE_CLOUDINARY_UNSIGNED_UPLOAD_PRESET="vox-profile-images"
```

Only the resulting Cloudinary HTTPS URL is stored in Firestore. If Cloudinary is not configured, members can use an initials avatar or paste an existing HTTPS image URL.

An unsigned preset name is intentionally public in a browser app. Keep its allowed formats, file-size limit, and folder restrictions enabled, and monitor the Cloudinary usage dashboard.

## Verification

```powershell
npm run lint
npm run test
npm run test:rules
npm run test:e2e
npm run build
npm audit --omit=dev
```

Playwright verifies iPhone SE, Pixel 5, and 768px tablet layouts, including horizontal overflow and the Resources tab tap target.

## Data Migration

Migration is dry-run by default and requires every imported record to map to an existing Firebase Authentication UID.

```powershell
npm run migrate:members -- --file C:\secure\members.csv
npm run migrate:members -- --file C:\secure\members.csv --commit
```

CSV and JSON are supported. The script validates records and atomically writes private and public projections. Do not commit source exports containing personal information.

Grant or revoke the administrator custom claim:

```powershell
npm run admin:set-role -- --uid FIREBASE_UID --admin true
npm run admin:set-role -- --uid FIREBASE_UID --admin false
```

Users must refresh their Firebase token after a claim change.

For a local claim change, download a service-account private key from **Firebase
Console > Project settings > Service accounts**, keep it outside this repository,
and pass it explicitly:

```powershell
npm run admin:set-role -- --email admin@example.org --admin true --service-account "C:\secure\vox-firebase-admin.json"
```

## Free Firebase Deployment

1. Create a Firebase web application.
2. Enable Email/Password authentication and optionally Google sign-in.
3. Create Firestore and configure the Firebase web variables in `.env.local`.
4. Configure Cloudinary only when file uploads are needed.
5. Deploy Firestore rules, indexes, and Hosting:

```powershell
npm run deploy:free
```

This command does not deploy Firebase Storage, Functions, or Cloud Run and is suitable for Firebase Spark quotas.

The optional Node API is not part of the free Firebase deployment. Without a separately hosted API, core authentication, Firestore directory, forms, and Cloudinary images continue to work; AI drafting, signed credentials, server audit logs, and server-approved workflows remain unavailable.

## Security Notes

- Never put `GEMINI_API_KEY`, service-account JSON, or signing secrets in `VITE_*` variables.
- Public profiles deliberately exclude email, phone, date of birth, blood group, and addresses.
- Profile-image files are checked for size, MIME type, and binary signature before Cloudinary upload.
- Audit log writes are server-only.
- Direct member edits by users are denied by rules and routed through the approval queue.
- Rotate secrets and review IAM, App Check metrics, Firestore usage, and Cloud Run logs before launch.
