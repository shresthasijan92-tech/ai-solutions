import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "studio-8019266465-1ccc6",
  appId: "1:379060175513:web:310946328a9300b9bd2e08",
  storageBucket: "studio-8019266465-1ccc6.firebasestorage.app",
  apiKey: "AIzaSyDK1Lh2MgO4r1nmmjpv0Cc0Ihn112DCeeg",
  authDomain: "studio-8019266465-1ccc6.firebaseapp.com",
  messagingSenderId: "379060175513",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
