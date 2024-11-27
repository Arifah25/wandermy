import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFqywrB-wPII7gYTHKEw_g7-wZeeOKPMQ",
  authDomain: "wandermy2.firebaseapp.com",
  databaseURL: "https://wandermy2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wandermy2",
  storageBucket: "wandermy2.appspot.com",
  messagingSenderId: "1019963731287",
  appId: "1:1019963731287:web:dd7054d91805eee747a212",
  measurementId: "G-6CMB0R3E7R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and provide AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Get a reference to the database service
const database = getDatabase(app);

// Get a reference to the storage service
const storage = getStorage(app);

// Get a reference to the firestore service
const firestore = getFirestore(app);

export { app, auth, database, storage, firestore };
