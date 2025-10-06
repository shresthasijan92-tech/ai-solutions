// This file holds the Firebase configuration.
// It reads the configuration from environment variables.

// IMPORTANT: Do not add any imports from 'firebase/*' here.
// This file is meant for configuration only.

export function getFirebaseConfig() {
    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    // Check if all required fields are present and not placeholders
    if (
        firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.projectId &&
        !firebaseConfig.projectId.includes('your-project-id')
    ) {
        return firebaseConfig;
    }

    return null;
}

// A flag to quickly check if the Firebase configuration is provided.
// This is useful for gracefully handling cases where Firebase is not set up.
export const isFirebaseConfigured = !!getFirebaseConfig();
