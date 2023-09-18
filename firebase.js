import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import the authentication module
import { onAuthStateChanged } from 'firebase/auth'; // Import the auth state change listener

const firebaseConfig = {
  
  apiKey: "AIzaSyAN9FReUv80jHRURWz2UwfZDLxsGgbJGx4",
  authDomain: "help-your-environment.firebaseapp.com",
  databaseURL: "https://help-your-environment-default-rtdb.firebaseio.com",
  projectId: "help-your-environment",
  storageBucket: "help-your-environment.appspot.com",
  messagingSenderId: "396096944712",
  appId: "1:396096944712:web:6dccb348faebbc71e8f67d",
  measurementId: "G-TX504644TP"

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Initialize the authentication module

// Add an auth state change listener to handle user sign-in/sign-out
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, you can access user information with 'user'
    console.log('User is signed in:', user);
  } else {
    // User is signed out
    console.log('User is signed out');
  }
});

export { db, auth };