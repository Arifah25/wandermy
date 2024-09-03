import { View, Text, ToastAndroid } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormField, Button } from "../../components";
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../configs/firebaseConfig";

const SignUp = () => {
  // for navigation
  const router = useRouter();

  // Initialize state variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  // Define the OnCreateAccount function to handle the sign-up process
  const OnCreateAccount = () => {
    // Check if all fields are filled in
    if (!email && !password && !username) {
      // If not, display a toast message to the user
      ToastAndroid.show('Please enter all details', ToastAndroid.BOTTOM)
    }

    // to create a new user
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // If the user is created successfully, get the user object
        const user = userCredential.user;
        // You can add additional logic here to handle the user object
        // For example, you can log the user object to the console for debugging
        // console.log(user);

        // Navigate to the sign-in page after a successful sign-up process
        router.push("(auth)/sign-in");
      })
      .catch((error) => {
        // If there's an error, get the error code and message
        const errorCode = error.code;
        const errorMessage = error.message;
        // Log the error message and code to the console for debugging
        console.log(errorMessage, errorCode);
      });
  }

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