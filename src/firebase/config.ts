// This file holds the configuration for your Firebase project.

// IMPORTANT:
// 1. You must replace the placeholder values below with your actual Firebase project credentials.
// 2. You can get these credentials from your Firebase project console:
//    - Go to https://console.firebase.google.com/
//    - Select your project.
//    - Click the gear icon (⚙️) > Project settings.
//    - In the "Your apps" card, select your web app.
//    - Click on "Config" to see your credentials.

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// This check prevents the app from crashing if the Firebase keys are still placeholders.
// If the projectId is a placeholder, the app will use mock data.
// Once you add your real keys, isConfigured will be true and the app will connect to Firebase.
export const isFirebaseConfigured = firebaseConfig.projectId !== 'YOUR_PROJECT_ID';

export { firebaseConfig };
