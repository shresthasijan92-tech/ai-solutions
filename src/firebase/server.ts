import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

// This file is for server-side use only.

let firebaseApp: FirebaseApp;
let firestore: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

if (getApps().length === 0) {
  try {
    // When deployed to App Hosting, GOOGLE_CLOUD_PROJECT is automatically set.
    // This is a reliable way to check if we're in a deployed environment.
    if (process.env.GOOGLE_CLOUD_PROJECT) {
      firebaseApp = initializeApp();
    } else {
      // For local development, use the config object.
      firebaseApp = initializeApp(firebaseConfig);
    }
  } catch (e) {
    console.warn(
      'Firebase initialization failed. Using config as fallback.',
      e
    );
    firebaseApp = initializeApp(firebaseConfig);
  }
} else {
  firebaseApp = getApp();
}

firestore = getFirestore(firebaseApp);
auth = getAuth(firebaseApp);
storage = getStorage(firebaseApp);

export { firebaseApp, firestore, auth, storage };
