import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Detect if using placeholder credentials
export const isFirebasePlaceholder = 
  !firebaseConfig || 
  firebaseConfig.apiKey === 'placeholder-api-key' ||
  !firebaseConfig.apiKey;

let firebaseApp;
let dbInstance;
let authInstance;

if (!isFirebasePlaceholder) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    dbInstance = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');
    authInstance = getAuth(firebaseApp);
    console.log('Firebase initialized with custom credentials');
  } catch (error) {
    console.error('Failed to initialize Firebase with credentials, falling back to mock mode:', error);
    isFirebasePlaceholder; // toggle back to safe fallback
  }
}

// Fallback handles
export const db = dbInstance;
export const auth = authInstance;

// If Firebase is misconfigured or missing, we fall back to local storage.
// If Firestore rules deny anonymous reads, we still treat Firebase as active
// (so admin/auth flows can work), but UI will handle read errors by falling back.
export const isPlaceholder = isFirebasePlaceholder || !dbInstance || !authInstance;

