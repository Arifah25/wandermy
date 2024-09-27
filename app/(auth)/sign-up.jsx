import React, { useState } from 'react';
import { View, Text, ToastAndroid, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormField, Button } from "../../components";
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../configs/firebaseConfig";
import { getDatabase, ref as databaseRef, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { icons } from '../../constants';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

const SignUp = () => {
  // for navigation
  const router = useRouter();

  const database = getDatabase();
  const storage = getStorage();

  // Initialize state variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  // Photo
  const uploadDefaultProfileImage = async (userUid) => {
    try {
      // Load the asset (local image)
      const asset = Asset.fromModule(icons.profile); // Load the local image asset
      await asset.downloadAsync(); // Ensure the asset is downloaded
  
      // Get the URI of the asset
      const fileUri = asset.localUri || asset.uri; // This will give the local path to the asset
  
      // Use fetch to convert the local image to a Blob
      const response = await fetch(fileUri);
      const blob = await response.blob(); // Convert the file into a blob
  
      // Set up a reference to the Firebase Storage location
      const storageReference = storageRef(getStorage(), `profilePictures/${userUid}`);
  
      // Upload the blob to Firebase Storage
      await uploadBytes(storageReference, blob);
  
      // Get the download URL of the uploaded image
      const profilePictureURL = await getDownloadURL(storageReference);
  
      return profilePictureURL; // Return the URL of the uploaded image
      
    } catch (error) {
      console.error("Error uploading default profile picture:", error);
      throw error; // Rethrow the error for further handling
    }
  };

  // Define the OnCreateAccount function to handle the sign-up process
  const OnCreateAccount = async () => {
    // Check if all fields are filled in
    if (!email && !password && !username) {
      // If not, display a toast message to the user
      ToastAndroid.show('Please fill in all fields', ToastAndroid.BOTTOM);
      return;
    }

    try {
      // Create the user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Upload the default profile image (icons.profile) to Firebase Storage
      const profilePictureURL = uploadDefaultProfileImage(user.uid); 

      // Save the user data to Firebase Realtime Database
      await set(databaseRef(database, 'users/' + user.uid), {
        email: email,
        username: username,
        userPreference: '',
        profilePicture: profilePictureURL, // Store the default profile picture URL
      });

      // Navigate to the sign-in page
      router.push("(auth)/sign-in");
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorMessage, errorCode);
    }
  };

  return (
    <SafeAreaView
      className="bg-white h-full flex-1 p-5 items-center justify-evenly"
    >
      <Text
        className="font-kregular text-2xl"
      >
        Create Account
      </Text>

      <View
        className="flex w-full items-center"
      >
        <FormField
          title="Username"
          handleChangeText={(value) => setUsername(value)}
        />

        <FormField
          title="Email"
          handleChangeText={(value) => setEmail(value)}
          keyboardType="email-address"
        />

        <FormField
          title="Password"
          handleChangeText={(value) => setPassword(value)}
        />
      </View>

      <Button
        title="Sign Up"
        handlePress={OnCreateAccount}
        style="bg-primary w-11/12"
        textColor="text-white"
      />

      <Link href="sign-in" className="text-base font-kregular">
        I'm already a member
      </Link>
    </SafeAreaView>
  )
}

export default SignUp;