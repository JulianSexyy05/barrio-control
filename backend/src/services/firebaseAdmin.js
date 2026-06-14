import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

let fbDebug = {};

function getServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!json) {
    fbDebug.error = "FIREBASE_SERVICE_ACCOUNT no definida";
    return null;
  }
  try {
    const account = JSON.parse(json);
    if (account.private_key) {
      account.private_key = account.private_key.replace(/\\n/g, "\n");
    }
    return account;
  } catch (e) {
    fbDebug.error = "JSON.parse: " + e.message;
    fbDebug.start = json.slice(0, 100);
    fbDebug.end = json.slice(-100);
    return null;
  }
}

const serviceAccount = getServiceAccount();

let initialized = false;
if (serviceAccount) {
  try {
    admin.initializeApp({ credential: admin.cert(serviceAccount) });
    initialized = true;
  } catch (e) {
    fbDebug.error = "admin.initializeApp: " + e.message;
    console.warn("Firebase Admin no se pudo inicializar:", e.message);
  }
}

export const db = initialized ? getFirestore() : null;

export function isFirebaseReady() {
  return initialized;
}

export function getFirebaseDebug() {
  return { initialized, ...fbDebug };
}

export async function verifyFirebaseToken(token) {
  if (!initialized) return null;
  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}
