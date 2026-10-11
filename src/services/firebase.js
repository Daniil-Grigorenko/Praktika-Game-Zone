import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBrzmkcgF2TuGLD8dA_MNCQiZsg1noR70E",
  authDomain: "praktikagamezone.firebaseapp.com",
  projectId: "praktikagamezone",
  storageBucket: "praktikagamezone.firebasestorage.app",
  messagingSenderId: "308988592712",
  appId: "1:308988592712:web:52c10179738a067771ce7d",
  measurementId: "G-J5YE2BGBV4"
};

const app = initializeApp ( firebaseConfig );

export const auth = getAuth(app);
export const db = getFirestore(app);