import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD5a3jSWW6u4zkkJZuYQPrsMaKrlR9sQFo",
  authDomain: "kamilo-atlas.firebaseapp.com",
  projectId: "kamilo-atlas",
  storageBucket: "kamilo-atlas.firebasestorage.app",
  messagingSenderId: "378824818065",
  appId: "1:378824818065:web:3cab6e9bf2549e1010ae30",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
