import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFirebaseConfig, isFirebaseConfigured } from './config';

let firebaseApp: FirebaseApp;
let firestore: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

if (isFirebaseConfigured) {
  const firebaseConfig = getFirebaseConfig();
  if (firebaseConfig) {
    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApp();
    }

    firestore = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    storage = getStorage(firebaseApp);
  }
}

// @ts-ignore
export { firebaseApp, firestore, auth, storage };
