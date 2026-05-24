import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAuILT9L3QtUpAMdjvIT1EyhszkVsyAJCc",
  authDomain: "soleer-hub.firebaseapp.com",
  projectId: "soleer-hub",
  storageBucket: "soleer-hub.firebasestorage.app",
  messagingSenderId: "832291416972",
  appId: "1:832291416972:web:252469b37cb928991544a9",
  measurementId: "G-L1397YMBRC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
