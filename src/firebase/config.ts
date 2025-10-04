// This file holds the configuration for your Firebase project.
// It reads the configuration from environment variables.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// This check determines if the app is configured.
// It checks for the presence of a project ID. If it's missing or a placeholder,
// the app will fall back to using mock data.
const isFirebaseConfigured = !!firebaseConfig.projectId && firebaseConfig.projectId !== 'YOUR_PROJECT_ID';

export { firebaseConfig, isFirebaseConfigured };
