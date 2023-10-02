import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

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
const auth = getAuth(app);
const storage = getStorage(app); // Initialize Firebase Storage

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

// Function to upload an image to Firebase Storage and return the download URL
const uploadImageToFirebaseStorage = async (imageUri) => {
  try {
    const imageRef = storageRef(storage, 'images/' + Date.now());
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Upload the image
    await uploadBytes(imageRef, blob);

    // Get the download URL after successful upload
    const downloadURL = await getDownloadURL(imageRef);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export { db, auth, uploadImageToFirebaseStorage };
