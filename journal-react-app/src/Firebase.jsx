import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: VITE_FB_AUTH_DOMAIN,
  projectId: VITE_FB_PROJECT_ID,
  storageBucket: VITE_FB_STORAGE_BUCKET,
  messagingSenderId: VITE_FB_MESSAGIN_SENDER_ID,
  appId: VITE_FB_APP_ID,
  measurementId: VITE_FB_MEASUREMENT_ID
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebase);
const auth = getAuth(firebase);
const db = getFirestore(firebase);

export {firebase, auth, db}