import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYmq6ZUTqVUhVi3490ssDW8ErXo-UsLfM",
  authDomain: "shikshyasetu-dabe2.firebaseapp.com",
  projectId: "shikshyasetu-dabe2",
  storageBucket: "shikshyasetu-dabe2.firebasestorage.app",
  messagingSenderId: "778363983589",
  appId: "1:778363983589:web:d4d18298e7970e6d0e660c",
  measurementId: "G-H0756P8LWC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
