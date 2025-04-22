// src/firebase/config.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDLzb9tHMddo9b5sVwMWFfeeIMhxZ0k6fk",
  authDomain: "marsosv7.firebaseapp.com",
  projectId: "marsosv7",
  storageBucket: "marsosv7.firebasestorage.app",
  messagingSenderId: "981717697036",
  appId: "1:981717697036:web:cfcebc2a9cd398ffc52429",
  measurementId: "G-RZH7VK2P51",
};

const app = initializeApp(firebaseConfig);

// On the server (or during SSG) window is undefined, so fall back to getAuth.
// In the browser, use initializeAuth(...) WITH appVerificationDisabledForTesting.
export const auth =
  typeof window !== "undefined"
    ? initializeAuth(app, {
        persistence: browserLocalPersistence,
        appVerificationDisabledForTesting: true,
      })
    : getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
