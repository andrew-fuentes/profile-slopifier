import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();

if (!projectId) {
  throw new Error('Set FIREBASE_PROJECT_ID in the server environment or server/.env.');
}

const firebaseApp = initializeApp({ projectId, credential: applicationDefault() });

export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
