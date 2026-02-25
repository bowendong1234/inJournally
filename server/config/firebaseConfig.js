const admin = require('firebase-admin');
const dotenv = require('dotenv');

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

const hasServiceAccount = Boolean(serviceAccount.project_id && serviceAccount.client_email && serviceAccount.private_key);

if (!admin.apps.length) {
  const options = {
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'journal-88326.appspot.com',
  };

  if (hasServiceAccount) {
    options.credential = admin.credential.cert(serviceAccount);
  } else {
    options.credential = admin.credential.applicationDefault();
  }

  admin.initializeApp(options);
}

const bucket = admin.storage().bucket();
const db = admin.firestore();

module.exports = { admin, bucket, db, serviceAccount };
