// firebaseConfig.js

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration (live project)
const firebaseConfig = {
  apiKey: "AIzaSyAE6aZnF5pjBoVP2gBv8zmP3M1v5j9dFe8",
  authDomain: "msikawanjalalogistics.firebaseapp.com",
  projectId: "msikawanjalalogistics",
  storageBucket: "msikawanjalalogistics.firebasestorage.app",
  messagingSenderId: "657919778584",
  appId: "1:657919778584:web:8eccc05a4d58413990486d",
  measurementId: "G-RRBZ2ZD41K"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Only initialize analytics if it's not already initialized (optional but good practice)
let analytics;
if (typeof window !== 'undefined') { // Analytics is only for web
  analytics = getAnalytics(app);
}

export { app, auth, db };
