import { View, Text, Image, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from "../../constants";
import { FormField, Button } from "../../components";
import { Link, useRouter } from 'expo-router';
import { auth } from "../../configs/firebaseConfig";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // State for login process
  const [loading, setLoading] = useState(false); // State for forgot password process

  const OnSignIn = async () => {
    if (!email && !password) {
      Alert.alert('Error', 'Please enter all details');
    } else {
      setIsSubmitting(true); // Show loading indicator
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (email === 'u2001083@siswa.um.edu.my' && password === 'Admin123!') {
          Alert.alert('Success', 'Sign In Admin Successful');
          setTimeout(() => {
            router.push("(admin)/"); // Redirect to admin home
          }, 1500);
        } else {
          Alert.alert('Success', 'Sign In Successful');
          setTimeout(() => {
            router.push("(tabs)/(home)"); // Redirect to regular user home
          }, 1500);
        }
      } catch (error) {
        console.error(error.message, error.code);
        Alert.alert('Error', 'Invalid Email or Password');
      } finally {
        setIsSubmitting(false); // Hide loading indicator
      }
    }
  };

  const handleForgotPassword = async () => {
    if (forgotPasswordEmail) {
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, forgotPasswordEmail);
        Alert.alert('Password reset link sent to your email!');
        setShowModal(false); // Close modal
      } catch (error) {
        Alert.alert('Error', 'Error sending reset email. Try again!');
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Please enter your email address.');
    }
  };

  return (
    <SafeAreaView className="bg-white h-full flex-1 px-5 items-center justify-start">
      <Image 
        source={icons.wandermy}
        resizeMode="contain"
        className="w-56 h-56 items-center"
      />

      <FormField 
        title="Email"
        handleChangeText={(value) => setEmail(value)} 
        keyboardType="email-address"
      />

      <FormField
        title="Password"
        handleChangeText={(value) => setPassword(value)} 
        keyboardType="default"
      />

      <View className="w-11/12 px-2 -mt-4 items-end">
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Text className="text-base font-ksemibold underline">Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <Button 
        title="Log In"
        handlePress={OnSignIn} 
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

      {/* Loading Indicator for Login */}
      {isSubmitting && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <ActivityIndicator size="large" color="#fff" />
          </View>
        </Modal>
      )}

      {/* Modal for Forgot Password */}
      <Modal visible={showModal} transparent>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-5/6 bg-white p-6 rounded-lg center">
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
  );
};

export default SignIn;
