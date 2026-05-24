import admin from 'firebase-admin';
import { readFileSync } from 'fs';

let initialized = false;
let credentialsAvailable = false;

export function hasCredentials(): boolean {
  return credentialsAvailable;
}

export function initFirebaseAdmin(): void {
  if (initialized) return;
  initialized = true;

  const projectId = process.env.FIREBASE_PROJECT_ID ?? 'petfinder-c8561';

  // Explicit service account — most reliable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const credential = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({ credential: admin.credential.cert(credential), projectId });
      credentialsAvailable = true;
      console.log('[Firebase Admin] Initialized with service account (env var)');
      return;
    } catch (err: any) {
      console.error('[Firebase Admin] Invalid FIREBASE_SERVICE_ACCOUNT JSON:', err.message);
    }
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      const credential = JSON.parse(readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(credential), projectId });
      credentialsAvailable = true;
      console.log('[Firebase Admin] Initialized with service account (file)');
      return;
    } catch (err: any) {
      console.error('[Firebase Admin] Could not read service account file:', err.message);
    }
  }

  // Application Default Credentials — works automatically in GCP/Cloud Run/Firebase Hosting
  // Also works locally when GOOGLE_APPLICATION_CREDENTIALS env var is set
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId });
      credentialsAvailable = true;
      console.log('[Firebase Admin] Initialized with Application Default Credentials');
      return;
    } catch (err: any) {
      console.error('[Firebase Admin] ADC init failed:', err.message);
    }
  }

  // No credentials available — server runs in fallback mode
  console.warn('');
  console.warn('[Firebase Admin] ⚠️  No credentials configured — server running in FALLBACK MODE');
  console.warn('[Firebase Admin]    Bookings will be written directly from the browser (less safe).');
  console.warn('[Firebase Admin]    To enable atomic writes: set FIREBASE_SERVICE_ACCOUNT in .env');
  console.warn('[Firebase Admin]    See .env.example for instructions.');
  console.warn('');
  // Initialize without credentials so Admin SDK is available for non-Firestore features
  try { admin.initializeApp({ projectId }); } catch { /* already initialized */ }
}

export function getAdminDb(databaseId?: string): admin.firestore.Firestore {
  const db = admin.firestore();
  if (databaseId ?? process.env.FIREBASE_DATABASE_ID) {
    // Named database support
    (db as any)._databaseId = { projectId: (db as any)._databaseId?.projectId ?? 'petfinder-c8561', databaseId: databaseId ?? process.env.FIREBASE_DATABASE_ID! };
  }
  return db;
}

export function getAdminAuth(): admin.auth.Auth {
  return admin.auth();
}

export default admin;
