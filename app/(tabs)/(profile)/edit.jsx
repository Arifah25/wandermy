import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { icons } from '../../../constants';
import { useRouter } from 'expo-router';
import { Button } from '../../../components';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Image } from 'expo-image';

const EditProfile = () => {
  const router = useRouter();

  const [profilePicture, setProfilePicture] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [tags, setTags] = useState("");
  const [userData, setUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // State for loading indicator

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
      setProfilePicture(result.assets[0].uri);
    }
  };

  const updateProfile = async () => {
    if (!userId) return;

    setIsSubmitting(true); // Show loading indicator

    const isUsernameTaken = async (username) => {
      try {
        const usersRef = ref(db, `users`);
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          for (const uid in usersData) {
            if (usersData[uid].username === username && uid !== userId) {
              return true;
            }
          }
        }
        return false;
      } catch (error) {
        console.error("Error checking username availability:", error);
        return false;
      }
    };

    if (username !== userData?.username) {
      const usernameTaken = await isUsernameTaken(username);
      if (usernameTaken) {
        Alert.alert("Error", "This username is already taken. Please choose another.");
        setIsSubmitting(false);
        return;
      }
    }

    let profilePictureURL = userData?.profilePicture;

    if (profilePicture && profilePicture !== userData?.profilePicture) {
      profilePictureURL = await uploadProfileImage(userId, profilePicture);
    }

    const updates = {
      username: username || userData.username,
      userPreference: tags || userData.userPreference,
      profilePicture: profilePictureURL,
    };

    try {
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, updates);

      Alert.alert("Success", "Profile updated successfully.");
      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "An error occurred while updating your profile.");
    } finally {
      setIsSubmitting(false); // Hide loading indicator
    }
  };

  return (
    <View className="bg-white h-full flex-1 p-5 justify-start">
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

      <TouchableOpacity onPress={handleChangeProfilePicture} className="items-center">
        
        <View
          style={{
            width: 170, // Adjust size for larger container
            height: 170, // Adjust size for larger container
            borderRadius: 85, // Should match half of the width/height for a perfect circle
            borderWidth: 1, // Thickness of the border
            borderColor: 'black', // Border color
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            source={{ uri: profilePicture } || icons.profile}
            className="w-40 h-40 rounded-full"
          />
        </View>
      </TouchableOpacity>

      <View className="w-full mt-7 px-5 flex-row items-center justify-center">
        <Text className="font-kregular text-base w-24">Email:</Text>
        <Text className="font-pregular p-2 text-gray-800">
          {email || "Not Available"}
        </Text>
      </View>
      
      <View className="w-full mt-7 px-5 flex-row items-center justify-center">
        <Text className="font-kregular text-base w-24">Username</Text>
        <View className="w-56 bg-white rounded-md h-10 justify-center border-2 border-secondary">
          <TextInput
            className="font-pregular p-2"
            value={username}
            placeholder="Enter new username"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setUsername(value)}
          />
        </View>
      </View>

      <View className="my-10 px-5">
        <Text className="font-kregular text-base">My Interests:</Text>
        <View className="mt-3 w-full bg-white rounded-md h-40 justify-start border-2 border-secondary">
          <TextInput
            className="font-pregular p-3"
            value={tags}
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
