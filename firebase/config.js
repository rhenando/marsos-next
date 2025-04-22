// src/firebase.config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

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

// ← use standard getAuth
const auth = getAuth(app);

// **Right here** force the testing flag
// If `settings` is missing, create it
auth.settings = auth.settings || {};
auth.settings.appVerificationDisabledForTesting = true;

const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

export { app, auth, db, functions, storage };
