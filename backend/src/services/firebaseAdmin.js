import admin from "firebase-admin";

function getServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!json) return null;
  try {
    const account = JSON.parse(json);
    if (account.private_key) {
      account.private_key = account.private_key.replace(/\\n/g, "\n");
    }
    return account;
  } catch {
    return null;
  }
}

const serviceAccount = getServiceAccount();

let initialized = false;
if (serviceAccount) {
  try {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    initialized = true;
  } catch {
    console.warn("Firebase Admin no se pudo inicializar.");
  }
}

export function isFirebaseReady() {
  return initialized;
}

export async function verifyFirebaseToken(token) {
  if (!initialized) return null;
  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}
