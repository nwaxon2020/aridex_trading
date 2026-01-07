// // lib/firebaseconfig.ts
// import { initializeApp, getApps } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//   NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyARpzCYjZrxuYklP1PxU2CDGBo3S36s3oc",
//   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "abitex-119cc.firebaseapp.com",
//   NEXT_PUBLIC_FIREBASE_PROJECT_ID: "abitex-119cc",
//   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "abitex-119cc.firebasestorage.app",
//   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "223546128782",
//   NEXT_PUBLIC_FIREBASE_APP_ID: "1:223546128782:web:d2829920a272cf38ae0cdf",
//   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-5LYYX37YEX",

// };

// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
// const db = getFirestore(app);
// const auth = getAuth(app);
// const storage = getStorage(app);

// export { db, auth, storage };

// lib/firebaseconfig.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyARpzCYjZrxuYklP1PxU2CDGBo3S36s3oc",
  authDomain: "abitex-119cc.firebaseapp.com",
  projectId: "abitex-119cc",
  storageBucket: "abitex-119cc.firebasestorage.app",
  messagingSenderId: "223546128782",
  appId: "1:223546128782:web:d2829920a272cf38ae0cdf",
  measurementId: "G-5LYYX37YEX"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };