import React, { useState } from 'react';
import { View, Text, ToastAndroid, TouchableOpacity, Image, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormField, Button } from "../../components";
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../../configs/firebaseConfig";
import { getDatabase, ref as databaseRef, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { icons } from '../../constants';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const SignUp = () => {
  const router = useRouter();
  const database = getDatabase();
  const storage = getStorage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordFeedbackList, setPasswordFeedbackList] = useState([]);
  const [reenterPassword, setReenterPassword] = useState(""); // Re-enter password field
  const [username, setUsername] = useState("");
  const [userPreference, setUserPreference] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [religion, setReligion] = useState("Islam");
  const [isSubmitting, setIsSubmitting] = useState(false); // State for loading indicator

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const passwordFeedback = (password) => {
    const requirements = [
      { regex: /.{8,}/, message: 'At least 8 characters' },
      { regex: /[A-Z]/, message: 'At least 1 uppercase letter' },
      { regex: /\d/, message: 'At least 1 number' },
      { regex: /[@$!%*?&]/, message: 'At least 1 special character' },
    ];

    return requirements.map((req) => ({
      message: req.message,
      met: req.regex.test(password),
    }));
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setPasswordFeedbackList(passwordFeedback(value)); // Update feedback
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const OnCreateAccount = async () => {
    if (!email || !password || !reenterPassword || !username || !userPreference || !religion) {
      Alert.alert('Error', 'Please fill in all fields to continue.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Invalid email format');
      return;
    }

    if (!passwordFeedbackList.every((req) => req.met)) {
      Alert.alert('Error', 'Password does not meet all requirements.');
      return;
    }

    if (password !== reenterPassword) {
      Alert.alert(
        'Error',
        'Password Mismatch. The passwords do not match. Please try again.'
      );
      return;
    }

    setIsSubmitting(true); // Show loading indicator

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let profilePictureUrl = icons.addPhoto; // Default profile icon if no picture is uploaded
      if (profileImage) {
        const storageReference = storageRef(storage, `profilePictures/${user.uid}`);
        const response = await fetch(profileImage);
        const blob = await response.blob();
        await uploadBytes(storageReference, blob);
        profilePictureUrl = await getDownloadURL(storageReference);
      }

      await set(databaseRef(database, `users/${user.uid}`), {
        email,
        username,
        userPreference,
        profilePicture: profilePictureUrl,
        religion,
        points: 0,
        badges: [],
      });

      await sendEmailVerification(user);
      ToastAndroid.show('Check your email to verify your account.', ToastAndroid.BOTTOM);

      Alert.alert('Success', 'Account created successfully. Check your email to verify your account.');
      router.push({
        pathname: "(auth)/sign-in",
        params: { email, username, userPreference, religion },
      });
    } catch (error) {
      const errorCode = error.code;
      switch (errorCode) {
        case 'auth/email-already-in-use':
          Alert.alert('Error', 'This email is already registered.');
          break;
        case 'auth/weak-password':
          Alert.alert('Error', 'The password is too weak.');
          break;
        case 'auth/invalid-email':
          Alert.alert('Error', 'Invalid email address.');
          break;
        default:
          Alert.alert('Error', 'An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false); // Hide loading indicator
    }
  };

  return (
    // <SafeAreaView className="bg-white h-full flex-1">
      <KeyboardAwareScrollView
      className="bg-white"
        contentContainerStyle={{ padding: 40, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
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
        <View className="flex w-full items-center">
          <TouchableOpacity onPress={pickImage}>
          <View
            style={{
              width: 130, // Adjust size for larger container
              height: 130, // Adjust size for larger container
              borderRadius: 65, // Should match half of the width/height for a perfect circle
              borderWidth: 1, // Thickness of the border
              borderColor: 'black', // Border color
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Image
              source={profileImage ? { uri: profileImage } : icons.addPhoto}
              style={{
                width: 100,
                height: 100,
              }}
            />
          </View>
          </TouchableOpacity>
          <Text className="font-kregular text-lg mb-5">Add Profile Picture</Text>

          <FormField title="Username" handleChangeText={(value) => setUsername(value)} />
          <FormField title="Email" handleChangeText={(value) => setEmail(value)} keyboardType="email-address" />
          <FormField title="Password" handleChangeText={handlePasswordChange} />
          <View style={{ width: '100%', marginBottom: 20 }}>
            {passwordFeedbackList.map((req, index) => (
              <Text
                key={index}
                style={{
                  color: req.met ? 'green' : 'red',
                  fontSize: 12,
                  marginBottom: 2,
                  marginTop:2,
                  marginLeft: 25,
                }}
              >
                {req.message}
              </Text>
            ))}
          </View>
          <FormField
            title="Re-enter Password"
            handleChangeText={(value) => setReenterPassword(value)}
          />
          <FormField title="What are you interested in? (eg: nature)" handleChangeText={(value) => setUserPreference(value)} />
        </View>

        <View className="mb-5 ml-4">
          <Text className="font-kregular text-xl">Religion :</Text>
          <View className="flex-row items-center mt-2">
            {['Islam', 'Hindu', 'Buddha', 'Others'].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setReligion(option)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 15,
                }}
              >
                <View
                  style={{
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: religion === option ? '#A91D1D' : '#ccc',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 4,
                  }}
                >
                  {religion === option && (
                    <View
                      style={{
                        height: 10,
                        width: 10,
                        borderRadius: 5,
                        backgroundColor: '#A91D1D',
                      }}
                    />
                  )}
                </View>
                <Text>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title="Sign Up"
          handlePress={OnCreateAccount}
          style="bg-primary w-11/12 mt-4"
          textColor="text-white"
        />

        <Link href="sign-in" className="text-base font-kregular mt-2">
          I'm already a member
        </Link>
      </KeyboardAwareScrollView>

      
    // </SafeAreaView>
  );
};

export default SignUp;
