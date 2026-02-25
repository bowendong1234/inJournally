import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: `${import.meta.env.VITE_FB_API_KEY}`,
  authDomain: `${import.meta.env.VITE_FB_AUTH_DOMAIN}`,
  projectId: `${import.meta.env.VITE_FB_PROJECT_ID}`,
  storageBucket: `${import.meta.env.VITE_FB_STORAGE_BUCKET}`,
  messagingSenderId: `${import.meta.env.VITE_FB_MESSAGIN_SENDER_ID}`,
  appId: `${import.meta.env.VITE_FB_APP_ID}`,
  measurementId: `${import.meta.env.VITE_FB_MEASUREMENT_ID}`
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebase);
const auth = getAuth(firebase);
const db = getFirestore(firebase);

export { firebase, auth, db }