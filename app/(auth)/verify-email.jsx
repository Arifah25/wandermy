import React, { useState, useEffect } from 'react';
import { View, Text, Button, ToastAndroid } from 'react-native';
import { useRoute, useRouter } from "expo-router";
import { auth } from "../../configs/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref as databaseRef, set } from "firebase/database";

const VerifyEmail = () => {
const route = useRoute();
  const router = useRouter();
  const { email, username, password, userPreference, profilePicture } = useRoute.params;
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkEmailVerification = async () => {
      await auth.currentUser.reload(); // Reload user info from Firebase
      setIsVerified(auth.currentUser.emailVerified);
    };

    const interval = setInterval(checkEmailVerification, 5000); // Check every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleVerified = async () => {
    if (isVerified) {
      const database = getDatabase();

      // Save user data to Firebase Realtime Database
      await set(databaseRef(database, `users/${auth.currentUser.uid}`), {
        email: email,
        username: username,
        userPreference: userPreference,
        profilePicture: profilePicture,
      });

      ToastAndroid.show("Email verified! Account created successfully.", ToastAndroid.BOTTOM);
      router.push("(auth)/sign-in");
    } else {
      ToastAndroid.show("Please verify your email before proceeding.", ToastAndroid.BOTTOM);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>
        Please verify your email: {email}
      </Text>
      <Text style={{ marginBottom: 16 }}>
        Once verified, click the button below to finalize your account creation.
      </Text>
      <Button title="I have verified my email" onPress={handleVerified} />
    </View>
  );
};

export default VerifyEmail;
