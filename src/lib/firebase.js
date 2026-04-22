import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyBkOFHvs9YcEyWSuXg1XHkHc6vsPIxQJ_o",
  authDomain: "fadialahmad-d625c.firebaseapp.com",
  projectId: "fadialahmad-d625c",
  storageBucket: "fadialahmad-d625c.firebasestorage.app",
  messagingSenderId: "659291377843",
  appId: "1:659291377843:web:742a137da4116ddfb9e0c6",
  measurementId: "G-B0C68FSYYW",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);