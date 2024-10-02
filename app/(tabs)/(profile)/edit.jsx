import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { icons } from '../../../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../../components';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker'; // to pick images
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const EditProfile = () => {
  const router = useRouter();

  const [profilePicture, setProfilePicture] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [tags, setTags] = useState("");
  const [userData, setUserData] = useState(null); // store the fetched user data

  const auth = getAuth();
  const db = getDatabase();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (userId) {
      const userRef = ref(db, `users/${userId}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserData(data);
          setUsername(data.username);
          setEmail(data.email);
          setTags(data.userPreference || "");
          setProfilePicture(data.profilePicture);
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });
    }
  }, [userId]);

  const uploadProfileImage = async (userUid, selectedImage) => {
    try {
      const storage = getStorage();
      const fileUri = selectedImage;

      const response = await fetch(fileUri);
      const blob = await response.blob();

      const storageReference = storageRef(storage, `profilePictures/${userUid}`);
      await uploadBytes(storageReference, blob);

      const profilePictureURL = await getDownloadURL(storageReference);
      return profilePictureURL;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
  };

  const handleChangeProfilePicture = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri); // Save the URI of the selected image
    }
  };

  const updateProfile = async () => {
    if (!userId) return;

    let profilePictureURL = userData?.profilePicture;

    // Upload new profile picture if the user selected one
    if (profilePicture && profilePicture !== userData?.profilePicture) {
      profilePictureURL = await uploadProfileImage(userId, profilePicture);
    }

    // Update Firebase Realtime Database with new data
    const updates = {
      username: username || userData.username,
      email: email || userData.email,
      userPreference: tags || userData.userPreference,
      profilePicture: profilePictureURL, // update the profile picture if it's changed
    };

    try {
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, updates);

      // Show a success message or navigate the user
      console.log("Profile updated successfully.");
      router.back(); // Assuming you have a profile page
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <View className="bg-white h-full flex-1 p-5 justify-start">
      <TouchableOpacity onPress={handleChangeProfilePicture} className="items-center">
        <Image
          source={{ uri: profilePicture } || icons.profile}
          className="w-40 h-40 rounded-full"
        />
      </TouchableOpacity>

      <View className="w-full mt-7 px-5 flex-row items-center justify-center">
        <Text className="font-kregular text-base w-24">Username</Text>
        <View className="w-56 bg-white rounded-md h-10 justify-center border-2 border-secondary">
          <TextInput
            className="font-pregular p-2"
            value={username} // Controlled input
            placeholder="Enter new username"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setUsername(value)}
          />
        </View>
      </View>

      <View className="w-full mt-7 px-5 flex-row items-center justify-center">
        <Text className="font-kregular text-base w-24">Email</Text>
        <View className="w-56 bg-white rounded-md h-10 justify-center border-2 border-secondary">
          <TextInput
            className="font-pregular p-2"
            value={email} // Controlled input
            placeholder="Enter new email"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setEmail(value)}
          />
        </View>
      </View>

      <View className="my-10 px-5">
        <Text className="font-kregular text-base">User preferences (optional)</Text>
        <View className="mt-3 w-full bg-white rounded-md h-40 justify-start border-2 border-secondary">
          <TextInput
            className="font-pregular p-3"
            value={tags} // Controlled input
            placeholder="Add preferences"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setTags(value)}
          />
        </View>
      </View>

      <View className="px-5 items-center">
        <Button
          title="Update"
          handlePress={updateProfile}
          style="bg-secondary w-1/3"
        />
      </View>
    </View>
  );
};

export default EditProfile;
