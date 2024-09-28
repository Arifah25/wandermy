import { TouchableOpacity, Text, View, Image, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as ImagePicker from 'expo-image-picker'; // Import image picker
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase storage

const AddPhoto = ({
   handlePress, 
   placeID, 
   folderName, 
   isMultiple, 
   isLoading }) => {
  const [images, setImages] = useState([]); // Store multiple images for price
  const [uploading, setUploading] = useState(false);

  // Function to open the image picker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: isMultiple || false, // Allow multiple selections if it's for price
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (isMultiple) {
        // Handle multiple images
        const selectedImages = result.assets.map((asset) => asset.uri);
        setImages(selectedImages); // Store selected images
        uploadMultipleImages(selectedImages); // Upload all images
      } else {
        const selectedImage = result.assets[0].uri;
        setImages([selectedImage]); // Store a single image
        uploadImageToFirebase(selectedImage); // Upload the image to Firebase
      }
    }
  };

  // Function to upload a single image to Firebase Storage
  const uploadImageToFirebase = async (uri) => {
    setUploading(true);
    const storage = getStorage();
    const storageRef = ref(storage, `${placeID}/${folderName}/${new Date().toISOString()}`); // Store in the correct folder
    const response = await fetch(uri);
    const blob = await response.blob(); // Convert image to blob for uploading

    // Upload the file to Firebase Storage
    uploadBytes(storageRef, blob)
      .then(async (snapshot) => {
        const downloadURL = await getDownloadURL(snapshot.ref); // Get the image URL
        handlePress(downloadURL); // Pass the image URL back to parent
      })
      .catch((error) => {
        console.error('Error uploading image:', error);
      })
      .finally(() => {
        setUploading(false);
      });
  };

  // Function to upload multiple images to Firebase Storage
  const uploadMultipleImages = async (uris) => {
    setUploading(true);
    const storage = getStorage();
    const uploadedUrls = [];

    for (const uri of uris) {
      const storageRef = ref(storage, `${placeID}/${folderName}/${new Date().toISOString()}`); // Store in the correct folder
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload each file to Firebase Storage
      try {
        const snapshot = await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(downloadURL); // Add each image URL to the list
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    // After all images are uploaded, pass the list of URLs to the parent
    handlePress(uploadedUrls);
    setUploading(false);
  };

  return (
    <TouchableOpacity
      onPress={pickImage}
      activeOpacity={0.7}
      className={`bg-secondary mt-1 w-full rounded-md h-14 justify-center items-center ${uploading ? "opacity-50" : ""}`}
      disabled={uploading}
    >
      <View className="w-full items-center justify-center flex-row gap-5">
        {uploading ? (
          <ActivityIndicator size="small" color="#000" /> // Show loading indicator during upload
        ) : (
          <>
            <AntDesign name="upload" size={24} color="black" />
            <Text className={`text-black font-kregular text-lg`}>
              {isMultiple ? 'Add Price Photo(s)' : 'Add Poster Photo'}
            </Text>
          </>
        )}
      </View>

      {images.length > 0 && (
        <View className="mt-3">
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={{ width: 100, height: 100, borderRadius: 8, marginBottom: 5 }} />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default AddPhoto;
