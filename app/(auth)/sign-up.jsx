import React, { useState } from 'react';
import { View, Text, ToastAndroid, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormField, Button } from "../../components";
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../../configs/firebaseConfig";
import { getDatabase, ref as databaseRef, set } from "firebase/database";
import { icons } from '../../constants';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const SignUp = () => {
  const router = useRouter();
  const database = getDatabase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState(""); // Re-enter password field
  const [username, setUsername] = useState("");
  const [userPreference, setUserPreference] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [religion, setReligion] = useState("Islam");

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
      ToastAndroid.show('Please fill in all fields', ToastAndroid.BOTTOM);
      return;
    }

    if (password !== reenterPassword) {
      Alert.alert('Password Mismatch', 'The passwords do not match. Please try again.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await set(databaseRef(database, `users/${user.uid}`), {
        email,
        username,
        userPreference,
        profilePicture: profileImage || icons.profile,
        religion,
      });

      await sendEmailVerification(user);
      ToastAndroid.show('Check your email to verify your account.', ToastAndroid.BOTTOM);

      router.push({
        pathname: "(auth)/sign-in",
        params: { email, username, userPreference, religion },
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  // //Uploading profile picture
  // const uploadDefaultProfileImage = async (userUid) => {
  //   try {
  //     // Load the asset (local image)
  //     const asset = Asset.fromModule(icons.profile); // Load the local image asset
  //     await asset.downloadAsync(); // Ensure the asset is downloaded
  
  //     // Get the URI of the asset
  //     const fileUri = asset.localUri || asset.uri; // This will give the local path to the asset
  
  //     // Use fetch to convert the local image to a Blob
  //     const response = await fetch(fileUri);
  //     const blob = await response.blob(); // Convert the file into a blob
  
  //     // Set up a reference to the Firebase Storage location
  //     const storageReference = storageRef(getStorage(), `profilePictures/${userUid}`);
  
  //     // Upload the blob to Firebase Storage
  //     await uploadBytes(storageReference, blob);
  
  //     // Get the download URL of the uploaded image
  //     const profilePictureURL = await getDownloadURL(storageReference);
  
  //     return profilePictureURL; // Return the URL of the uploaded image
  //   } catch (error) {
  //     console.error("Error uploading default profile picture:", error);
  //     throw error; // Rethrow the error for further handling
  //   }
  // };

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
          <FormField title="Password" handleChangeText={(value) => setPassword(value)} secureTextEntry />
          <FormField title="Re-enter Password" handleChangeText={(value) => setReenterPassword(value)} secureTextEntry/>
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