import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig, isFirebaseConfigured } from './config';

let firebaseApp: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
    if (getApps().length === 0) {
      try {
        if (process.env.GOOGLE_CLOUD_PROJECT) {
          firebaseApp = initializeApp();
        } else {
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

    if (firebaseApp) {
        firestore = getFirestore(firebaseApp);
        auth = getAuth(firebaseApp);
        storage = getStorage(firebaseApp);
    }
}


export { firebaseApp, firestore, auth, storage };
