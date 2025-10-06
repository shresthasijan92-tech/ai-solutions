import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFirebaseConfig, isFirebaseConfigured } from './config';

let firebaseApp: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

// Only initialize Firebase services if the configuration is valid.
if (isFirebaseConfigured) {
  const firebaseConfig = getFirebaseConfig();
  if (firebaseConfig) {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApp();
    }

    if (firebaseApp) {
        firestore = getFirestore(firebaseApp);
        auth = getAuth(firebaseApp);
        storage = getStorage(firebaseApp);
    }
  }
}

export { firebaseApp, firestore, auth, storage };
