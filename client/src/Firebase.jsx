import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: `${import.meta.env.VITE_FB_API_KEY}`,
  authDomain: `${import.meta.env.VITE_FB_AUTH_DOMAIN}`,
  projectId: `${import.meta.env.VITE_FB_PROJECT_ID}`,
  storageBucket: `${import.meta.env.VITE_FB_STORAGE_BUCKET}`,
  messagingSenderId: `${import.meta.env.VITE_FB_MESSAGIN_SENDER_ID}`,
  appId: `${import.meta.env.VITE_FB_APP_ID}`,
  measurementId: `${import.meta.env.VITE_FB_MEASUREMENT_ID}`
};

const firebase = initializeApp(firebaseConfig);
getAnalytics(firebase);
const auth = getAuth(firebase);
const db = getFirestore(firebase);
const storage = getStorage(firebase);
const functions = getFunctions(firebase);

export { firebase, auth, db, storage, functions }
