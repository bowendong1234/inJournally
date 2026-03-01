const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'journal-88326.appspot.com',
  });
}

const bucket = admin.storage().bucket();
const db = admin.firestore();

module.exports = { admin, bucket, db };
