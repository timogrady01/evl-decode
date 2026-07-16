// Shared Firebase Admin SDK initializer
// ONE source of truth for Firebase Admin credentials across all /api functions.
// Fixes: previously, 7 different api/*.js files called admin.firestore() directly
// with NO admin.initializeApp() call anywhere - meaning every one of them would
// throw "The default Firebase app does not exist" the moment they tried to touch
// Firestore. This file fixes that for all of them at once.

const admin = require('firebase-admin');

function getFirebaseAdmin() {
  // Guard against re-initializing on every function call (serverless functions
  // can reuse a warm instance, and calling initializeApp() twice throws an error)
  if (!admin.apps.length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountJson) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is missing. ' +
        'Set it in Vercel: Settings -> Environment Variables -> paste the full service account JSON.'
      );
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (parseError) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Make sure the entire ' +
        'downloaded JSON file contents were pasted as the env var value. Error: ' + parseError.message
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('[firebaseAdmin] Firebase Admin SDK initialized successfully');
  }

  return admin;
}

module.exports = { getFirebaseAdmin };
