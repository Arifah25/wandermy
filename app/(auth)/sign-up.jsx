import { View, Text, ToastAndroid, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useState } from 'react';
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
  
  // const validatePassword = (password) => {
  //   // return (
  //   //   password.length >= 8 &&
  //   //   /[A-Z]/.test(password) &&
  //   //   /\d/.test(password) &&
  //   //   /[@$!%*?&]/.test(password)
  //   // );
  //   const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  //   if (!strongPasswordRegex.test(password)) {
  //     return false; // Password does not meet the criteria
  //   }
  //   return true;
  // };

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

    // if (!validatePassword(password)) {
    //   Alert.alert(
    //     'Error',
    //     'Password must be at least 8 characters, include an uppercase letter, a number, and a special character.');
    //   return;
    // }
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

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if a profile image was selected
      let profilePictureUrl = icons.profile; // Default profile icon if no picture is uploaded
      if (profileImage) {
        // Upload the selected profile image to Firebase Storage
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
      });

      await sendEmailVerification(user);
      ToastAndroid.show('Check your email to verify your account.', ToastAndroid.BOTTOM);

      Alert.alert('Success', 'Account created successfully.');
      router.push({
        pathname: "(auth)/sign-in",
        params: { email, username, userPreference, religion },
      });
    } catch (error) {
      const errorCode = error.code;
      switch (errorCode) {
        case 'auth/email-already-in-use':
          Alert.alert('Error',' This email is already registered.');
          break;
        case 'auth/weak-password':
          Alert.alert('Error','The password is too weak.');
          break;
        case 'auth/invalid-email':
          Alert.alert('Error','Invalid email address.');
          break;
        default:
          Alert.alert('Error','An error occurred. Please try again.');
      }
    }
  };

  //Uploading profile picture
  const uploadDefaultProfileImage = async (userUid) => {
    try {
      // Load the asset (local image)
      const asset = asset.fromModule(icons.profile); // Load the local image asset
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

  //     // Save the user data to Firebase Realtime Database
  //     await set(databaseRef(database, 'users/' + user.uid), {
  //       email: email,
  //       username: username,
  //       userPreference: '',
  //       profilePicture: defaultProfileImage, // Store the default profile picture URL
  //     });

  //     // Navigate to the sign-in page
  //     router.push("(auth)/sign-in");
  //   } catch (error) {
  //     const errorCode = error.code;
  //     const errorMessage = error.message;
  //     console.error(errorMessage, errorCode);
  //   }
  // };

  
  return (
    <SafeAreaView className="bg-white h-full flex-1">
      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: 20, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-kregular text-2xl">Create Account</Text>
        <View className="flex w-full items-center">
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={profileImage ? { uri: profileImage } : icons.profile}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                marginBottom: 20,
              }}
            />
          </TouchableOpacity>

          <FormField title="Username" handleChangeText={(value) => setUsername(value)} />
          <FormField title="Email" handleChangeText={(value) => setEmail(value)} keyboardType="email-address" />
          {/* <FormField title="Password" handleChangeText={(value) => setPassword(value)} secureTextEntry /> */}
          <FormField
            title="Password"
            handleChangeText={handlePasswordChange}
          />        
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
          <FormField title="User Preference (eg: nature)" handleChangeText={(value) => setUserPreference(value)} />

          <View className="mb-5 ml-2">
            <Text className="font-kregular text-xl">Religion :</Text>
            <View className="flex-row items-center mt-2">
              {['Islam', 'Hindu', 'Buddha', 'Others'].map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setReligion(option)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 20,
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
                      marginRight: 8,
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
        </View>

        <Button
          title="Sign Up"
          handlePress={OnCreateAccount}
          style="bg-primary w-11/12 mt-10"
          textColor="text-white"
        />

        <Link href="sign-in" className="text-base font-kregular">
          I'm already a member
        </Link>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignUp;