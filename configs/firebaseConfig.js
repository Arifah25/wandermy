// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFqywrB-wPII7gYTHKEw_g7-wZeeOKPMQ",
  authDomain: "wandermy2.firebaseapp.com",
  projectId: "wandermy2",
  storageBucket: "wandermy2.appspot.com",
  messagingSenderId: "1019963731287",
  appId: "1:1019963731287:web:dd7054d91805eee747a212",
  measurementId: "G-6CMB0R3E7R"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Get a reference to the database service
const database = getDatabase(app);

// Get a reference to the storage service
const storage = getStorage(app);

export { app, auth, database, storage };
