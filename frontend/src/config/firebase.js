/**
 * Firebase Configuration
 * Real Firebase project: CreditSetu (creditsetu-a7025)
 * Phone Auth enabled for OTP verification
 */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

/**
 * Firebase Configuration
 * Values loaded from Vite environment variables with production fallbacks.
 * Copy .env.example to .env and fill in your Firebase credentials for local dev.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA9pUk-VML0b6ogXw_mspQTmnsFJsM0g2k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "creditsetu-a7025.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "creditsetu-a7025",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "creditsetu-a7025.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "637929619647",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:637929619647:web:acb5ddfad4e8817d1c860a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JVXPZ6RWDM",
};

const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log('[Firebase] Initialized successfully — project:', firebaseConfig.projectId);
  } catch (err) {
    console.warn('[Firebase] Init failed:', err.message);
  }
}

export { app, auth, googleProvider, isFirebaseConfigured, RecaptchaVerifier, signInWithPhoneNumber };
