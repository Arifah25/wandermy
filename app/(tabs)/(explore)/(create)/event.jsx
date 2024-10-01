import { View, Text, ScrollView, Modal, Switch } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'; // Correct hook for search params
import { AddPhoto, Button, CreateForm, DateField, Map, TimeField, } from '../../../../components'
import { getDatabase, ref, push, set } from "firebase/database";
import { getAuth } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";


const CreateEvent = () => {
  
  // Use the useRouter hook to get the router object for navigation
  const router = useRouter();
  const { latitude, longitude, address } = useLocalSearchParams(); // Use the correct hook

  //database and get user ID
  const db = getDatabase();
  const auth = getAuth();
  const userId = auth.currentUser.uid;

  // Initialize state variables for attributes in event
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPlaceRef, setNewPlaceRef] = useState(null);
  const [placeID, setPlaceID] = useState(null);
  const [form, setForm] = useState({
    name: '',
    latitude: '',
    longitude: '',
    address: '',
    websiteLink: '',
    contactNum: '',
    price: [],
    poster: [], 
    tags: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
  });

  // Store selected images in state
  const [posterImages, setPosterImages] = useState([]);
  const [priceImages, setPriceImages] = useState([]);

  const uploadImages = async (images, folderName) => {
    const storage = getStorage();
    const uploadedUrls = [];
    
    for (const uri of images) {
      const storageRef1 = storageRef(storage, `places/event/${placeID}/${folderName}/${new Date().toISOString()}`);
      const response = await fetch(uri);
      const blob = await response.blob();
      
      try {
        const snapshot = await uploadBytes(storageRef1, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(downloadURL); // Collect uploaded image URLs
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    
    return uploadedUrls;
  };

  // If latitude and longitude are passed from the PinLocation page, update the form state
  useEffect(() => {
    if (latitude && longitude) {
      setForm((prevForm) => ({
        ...prevForm,
        latitude: latitude || prevForm.latitude,
        longitude: longitude || prevForm.longitude,
        // address: address || prevForm.address, // Optional: Update address too if passed
      }));
    }
  }, [latitude, longitude]);

  useEffect(() => {
    const generatePlaceID = async () => {
      try {
        const placeRef = ref(db, 'places');
        const newPlaceRef = push(placeRef);
        const newPlaceID = newPlaceRef.key;
        setPlaceID(newPlaceID);
        setNewPlaceRef(newPlaceRef);
      } catch (error) {
        console.error('Error generating places ID: ', error);
      }
    };

    generatePlaceID();
  }, []);
  

  const handlePost = async () => {
    setIsSubmitting(true);
    try {
      // Upload images and get the URLs
      const posterUrls = await uploadImages(posterImages, 'poster');
      const priceUrls = await uploadImages(priceImages, 'price');

      const placeData = {
        placeID,
        name: form.name,
        latitude: form.latitude,
        longitude: form.longitude,
        address: form.address,
        contactNum: form.contactNum,
        poster: posterUrls, // Use uploaded URLs
        price_or_menu: priceUrls,
        tags: form.tags,
        description: form.description,
        category: 'event',
        status: 'pending',
        user: userId,
      };
      await set(newPlaceRef, placeData);

      // Save opening hours
      const eventRef = ref(db, `event/${placeID}`);
      
        await set(eventRef, {
          startDate: form.startDate,
          endDate: form.endDate,
          startTime: form.startTime,
          endTime: form.endTime,
        });

      setIsSubmitting(false);
      console.log('uploaded');
      router.back();
      } catch (error) {
        console.error(error);
        setIsSubmitting(false);
    }
  };
  const toggleModalVisibility = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleMap = () => {
    toggleModalVisibility();
  };

  const handleLocationSelected = (locationData) => {
    // console.log('Selected Location:', locationData);
    
    // Update the form with latitude and longitude from the locationData
    setForm((prevForm) => ({
      ...prevForm,
      latitude: locationData.latitude,  // Set latitude
      longitude: locationData.longitude, // Set longitude
      address: prevForm.address || locationData.address, // Optional: Update address if passed
    }));
  
    // Close the modal
    toggleModalVisibility();
  };

  const handlePosterImagePicked = (imageURL) => {
    // Update the form state with the new poster image URL
    setForm({ ...form, poster: [...form.poster, imageURL] });
  };
  
  const handlePriceImagesPicked = (imageURLs) => {
    // Update the form state with the new price image URLs
    setForm({ ...form, price: [...form.price, ...imageURLs] }); // Append multiple image URLs
  };
  
  
  return (
    // <SafeAreaView>
      <ScrollView
      className="flex-1 h-full px-8 bg-white"
      >
        <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        >
          <Map 
           onLocationSelected={handleLocationSelected}
           confirmButtonText="Set Location"
           placeholderText="Select your preferred location on the map"
          />
        </Modal>
        <View
        className="my-5"
        >
          <Text
          className="font-kregular text-xl"
          >
            Poster :
          </Text>
          {/* image picker for poster */}
          <AddPhoto
            images={posterImages}
            setImages={setPosterImages} // Pass the state setters to AddPhoto
            isLoading={isSubmitting}
          />

        </View>
        <CreateForm 
        title="Event name :"
        value={form.name}
        handleChangeText={(e) => setForm({ ...form, name: e })}      />

        <View className="mb-5">
        <Text
          className="font-kregular text-xl"
          >
            When does the event start and end ? 
          </Text>
          <View 
          className="flex-row justify-start my-5 items-center"
          >
            <Text
            className="w-14 text-lg font-kregular">
              Date :
            </Text>
            <View className="w-4/5 flex-row justify-evenly">
              <DateField 
              placeholder="Start Date"
              value={form.startDate}
              handleChangeText={(e) => setForm({ ...form, startDate: e })}
              />
              <DateField 
              placeholder="End Date"
              value={form.endDate}
              handleChangeText={(e) => setForm({ ...form, endDate: e })}
              />
            </View>
          </View>
          <View className="flex-row justify-start items-center">
          <Text
            className="w-14 text-lg font-kregular">
              Time :
            </Text>
            <View className="w-4/5 flex-row justify-evenly">
              <TimeField 
              placeholder="Start Time"
              value={form.startTime}
              handleChangeText={(e) => setForm({ ...form, startTime: e })}
              />
              <TimeField 
              placeholder="End Time"
              value={form.endTime}
              handleChangeText={(e) => setForm({ ...form, endTime: e })}
              />
            </View>
          </View>
        </View>

        <View
        className="items-center mb-5"
        >
          <CreateForm
          title="Address :"
          value={form.address}
          tags="true"
          handleChangeText={(e) => setForm({ ...form, address: e })}       
           />
          {/* pin location */}
          <Button 
          title="Pin Location"
          handlePress={handleMap}
          style="bg-secondary w-full"
          textColor="text-black ml-5"
          location="true"
          />

        </View>

        <View
        className="mb-5"
        >
          <Text
          className="font-kregular text-xl"
          >
            Ticket Price :
          </Text>
          {/* image picker for price */}
          <AddPhoto
            isMultiple={true}
            images={priceImages}
            setImages={setPriceImages} // Pass the state setters to AddPhoto
            isLoading={isSubmitting}
          />

        </View>
      
        <CreateForm 
        title="Contact Number :"
        value={form.contactNum}
        handleChangeText={(e) => setForm({ ...form, contactNum: e })}
        keyboardType="phone-pad"
        />

         <CreateForm
         title="Description of the event :" 
         value={form.description}
         handleChangeText={(e) => setForm({ ...form, description: e })}
         keyboardType="default"
         tags="true"
         /> 
        
        <CreateForm 
        title="Tags :"
        value={form.tags}
        handleChangeText={(e) => setForm({ ...form, tags: e })}
        keyboardType="default"
        tags="true"
        />
        <View
        className="flex-row items-center justify-evenly mt-5 mb-10">
          <Button 
          title="Cancel"
          handlePress={() => router.back()}
          style="bg-secondary w-2/5"
          textColor="text-primary"
          />
          <Button 
          title="POST"
          handlePress={handlePost}
          style="bg-primary w-2/5"
          textColor="text-white"/>
        </View>
      </ScrollView>      
    // </SafeAreaView>
  )
}

export default CreateEvent