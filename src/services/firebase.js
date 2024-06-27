// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDGVVSPIBa-OY_eDAa_vU0yAX7ffsZqkpw",
  authDomain: "todolist-e8c13.firebaseapp.com",
  projectId: "todolist-e8c13",
  storageBucket: "todolist-e8c13.appspot.com",
  messagingSenderId: "1097068272002",
  appId: "1:1097068272002:web:2c750dbb827b7bd597979b",
  measurementId: "G-S4VL4S08L2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db= getFirestore(app);