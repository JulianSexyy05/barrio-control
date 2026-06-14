import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

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
    admin.initializeApp({ credential: admin.cert(serviceAccount) });
    initialized = true;
  } catch {
    console.warn("Firebase Admin no se pudo inicializar.");
  }
}

export const db = initialized ? getFirestore() : null;

export function isFirebaseReady() {
  return initialized;
}

export async function verifyFirebaseToken(token) {
  if (!initialized) return { error: "Firebase no inicializado" };
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (e) {
    return { error: e.message };
  }
}
