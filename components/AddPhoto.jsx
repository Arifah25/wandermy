import { TouchableOpacity, Text, View, Image, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as ImagePicker from 'expo-image-picker'; // Import image picker
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase storage

const AddPhoto = ({
  isMultiple,
  isLoading,
  images,          // Pass the selected images from the parent component
  setImages        // Function to update selected images in the parent component
}) => {
  const [uploading, setUploading] = useState(false);

  // Function to open the image picker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: isMultiple || false, // Allow multiple selections if it's for price
      allowsEditing: !isMultiple, // Disable editing when multiple selection is enabled
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (isMultiple) {
        const selectedImages = result.assets.map((asset) => asset.uri);
        setImages([...images, ...selectedImages]); // Append selected images to the current list
      } else {
        const selectedImage = result.assets[0].uri;
        setImages([selectedImage]); // Replace the current image
      }
    }
  };

  // Remove a selected image
  const removeImage = (uri) => {
    const updatedImages = images.filter((image) => image !== uri);
    setImages(updatedImages);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={pickImage}
        activeOpacity={0.7}
        className={`bg-secondary mt-1 w-full rounded-md h-14 justify-center items-center ${uploading ? "opacity-50" : ""}`}
        disabled={uploading || isLoading}
      >
        <View className="w-full items-center justify-center flex-row gap-5">
          {uploading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <AntDesign name="upload" size={24} color="black" />
              <Text className={`text-black font-kregular text-lg`}>
                Add Photo(s)
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
      {/* Display Selected Images */}
      {images.length > 0 && (
        <View className="flex-row mt-3 flex-wrap">
          {images.map((uri, index) => (
            <View key={index} style={{ position: 'relative' }}>
              <Image source={{ uri }} style={{ width: 75, height: 75, marginBottom: 5, marginRight: 5 }} />
              <TouchableOpacity
                onPress={() => removeImage(uri)}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: 12,
                  padding: 3,
                }}
              >
                <AntDesign name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default AddPhoto;