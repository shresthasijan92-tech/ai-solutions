// This file holds the configuration for your Firebase project.
// It is ESSENTIAL that you replace the placeholder values with your actual
// Firebase project credentials to connect to the database.

// You can find your Firebase configuration object in your project's settings in the Firebase console:
// https://console.firebase.google.com/

// 1. Go to Project settings (gear icon).
// 2. In the "Your apps" card, select your web app.
// 3. Under "SDK setup and configuration", select "Config".
// 4. Copy the values into the object below.

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // This is optional
};

// This check determines if the app is configured.
// When you fill in your details, this will become `true`.
const isFirebaseConfigured = !!firebaseConfig.projectId && firebaseConfig.projectId !== 'YOUR_PROJECT_ID';

export { firebaseConfig, isFirebaseConfigured };
