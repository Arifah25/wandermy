import { View, Text, Image, ToastAndroid, Modal, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from "../../constants";
import { FormField, Button } from "../../components";
import { Link, useRouter } from 'expo-router';
import { auth } from "../../configs/firebaseConfig"; // Import auth from firebaseConfig
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"; // Import signInWithEmailAndPassword from firebase/auth

const SignIn = () => {
  // Use the useRouter hook to get the router object for navigation
  const router = useRouter();

  // Initialize state variables for email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Define the OnSignIn function to handle the sign-in process
  const OnSignIn = () => {
    // Check if all fields are filled in
    if (!email && !password) {
      // If not, display a toast message to the user
      ToastAndroid.show('Please enter all details', ToastAndroid.BOTTOM)
    } else {
      // Sign in with email and password
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in 
          const user = userCredential.user;

          // Check if email is verified
          // if (user.emailVerified) {
            // Display a toast message for 3 seconds
            //check if the user is admin
            if(email === 'admin@gmail.com' && password === 'admin123'){
              console.log('Sign In Admin Successful');
              // Navigate to the home index under tabs after 3 seconds
              setTimeout(() => {
                router.push("(admin)/");
              }, 1500);
            }else{
              ToastAndroid.show('Sign In Successful', ToastAndroid.BOTTOM, ToastAndroid.LONG);
              // Navigate to the home index under tabs after 3 seconds
              setTimeout(() => {
                router.push("(tabs)/(home)/");
              }, 1500);
            } 
          // }else{
          //   ToastAndroid.show('Please verify your email before signing in.', ToastAndroid.BOTTOM);
          //   return;
          // }
        })
        .catch((error) => {
          // If there's an error, get the error code and message
          const errorCode = error.code;
          const errorMessage = error.message;
          // Log the error message and code to the console for debugging
          console.log(errorMessage, errorCode);
          if (errorCode=='auth/invalid-credential') {
            ToastAndroid.show('Invalid Email or Password', ToastAndroid.BOTTOM)            
          }
        });
    }
  }

 const handleForgotPassword = async () => {
    if (forgotPasswordEmail) {
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, forgotPasswordEmail);
        ToastAndroid.show('Password reset link sent to your email!', ToastAndroid.BOTTOM);
        setShowModal(false); // Close the modal
      } catch (error) {
        ToastAndroid.show('Error sending reset email. Try again!', ToastAndroid.BOTTOM);
      } finally {
        setLoading(false);
      }
    } else {
      ToastAndroid.show('Please enter your email address.', ToastAndroid.BOTTOM);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full flex-1 px-5 items-center justify-start">
      
      <Image 
        source={icons.wandermy}
        resizeMode='contain'
        className="w-56 h-56 items-center"
      />

      <FormField 
        title="Email"
        handleChangeText={(value) => setEmail(value)} // Update the email state variable
        keyboardType="email-address"
      />

      <FormField
        title="Password"
        handleChangeText={(value) => setPassword(value)} // Update the password state variable
        keyboardType="default"
      />

      <View className="w-11/12 px-2 -mt-4 items-end">
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Text className="text-base font-ksemibold underline">Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <Button 
        title="Log In"
        handlePress={OnSignIn} // Call the OnSignIn function when the button is pressed
        style="bg-primary w-11/12 mt-20"
        textColor="text-white"
      />

      <Text className="text-base font-kregular mt-7">
        Not a member ?
      </Text>

      <Button 
        title="Sign Up"
        handlePress={() => router.push("(auth)/sign-up")}
        style="bg-white w-11/12 mt-2 border-2 border-secondary"
        textColor="text-primary"
      />

        {/* Modal for Forgot Password */}
        <Modal visible={showModal} transparent >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="w-5/6 bg-white p-6 rounded-lg center">
              {/* Close Button */}
            <TouchableOpacity 
              onPress={() => setShowModal(false)} 
              style={{ position: 'absolute', top: 10, right: 10 }}
            >
              <Image source={icons.close} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
            <FormField
                title="Enter your registered email:"
                placeholder="Email"
                handleChangeText={setForgotPasswordEmail}
                value={forgotPasswordEmail}
                keyboardType="email-address"
                style={{ width: '100%', height: 50 }}
              />
              <TouchableOpacity onPress={handleForgotPassword} disabled={loading} className="bg-primary p-3 rounded-lg">
                <Text className="text-center text-white">{loading ? 'Sending...' : 'Send Reset Link'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowModal(false)} className="mt-4 border-2 border-primary p-3 rounded-lg">
                <Text className="text-center text-primary">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


    </SafeAreaView>
  )
}

export default SignIn;