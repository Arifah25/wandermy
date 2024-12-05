import { View, Text, ScrollView, Modal, Switch, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'; // Correct hook for search params
import { AddPhoto, Button, CreateForm, Map, TimeField, } from '../../../../components'
import { getDatabase, ref, push, set } from "firebase/database";
import { getAuth } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const CreateAttraction = () => {
  
  // Use the useRouter hook to get the router object for navigation
  const router = useRouter();
  const { latitude, longitude, address } = useLocalSearchParams(); // Use the correct hook

  //database and get user ID
  const db = getDatabase();
  const auth = getAuth();
  const userId = auth.currentUser.uid;

  // Initialize state variables for attributes in attraction
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
    admissionType: 'free', // Default is Free Admission
    operatingHours: [
      { dayOfWeek: 'MON', isOpen: true, openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'TUE', isOpen: true, openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'WED', isOpen: true, openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'THU', isOpen: true, openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'FRI', isOpen: true, openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'SAT', isOpen: true, openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'SUN', isOpen: true, openingTime: '9:00 AM', closingTime: '10:00 PM' },
    ],
  });

  // Store selected images in state
  const [posterImages, setPosterImages] = useState([]);
  const [priceImages, setPriceImages] = useState([]);

  const handleAdmissionTypeChange = (type) => {
    setForm((prevForm) => ({
      ...prevForm,
      admissionType: type,
      price: type === 'free' ? [] : prevForm.price, // Clear price if free admission
    }));
  };

  const uploadImages = async (images, folderName) => {
    const storage = getStorage();
    const uploadedUrls = [];
    
    for (const uri of images) {
      const storageRef1 = storageRef(storage, `places/attraction/${placeID}/${folderName}/${new Date().toISOString()}`);
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
  
  const handleChangeOpeningTime = (dayOfWeek, time) => {
    const updatedOperatingHours = form.operatingHours.map((day) =>
      day.dayOfWeek === dayOfWeek ? { ...day, openingTime: time } : day
    );
    // 
    setForm({ ...form, operatingHours: updatedOperatingHours });
  };

  const handleChangeClosingTime = (dayOfWeek, time) => {
    const updatedOperatingHours = form.operatingHours.map((day) =>
      day.dayOfWeek === dayOfWeek ? { ...day, closingTime: time } : day
    );
    setForm({ ...form, operatingHours: updatedOperatingHours });
  };

  const handleToggleDayOpen = (dayOfWeek) => {
    const updatedOperatingHours = form.operatingHours.map((day) =>
      day.dayOfWeek === dayOfWeek ? { ...day, isOpen: !day.isOpen } : day
    );
    setForm({ ...form, operatingHours: updatedOperatingHours });
  };

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
        websiteLink: form.websiteLink,
        contactNum: form.contactNum,
        poster: posterUrls, // Use uploaded URLs
        price_or_menu: priceUrls,
        tags: form.tags,
        category: 'attraction',
        status: 'pending',
        user: userId,
        admissionType: form.admissionType,

      };
      await set(newPlaceRef, placeData);

      // Save opening hours
      form.operatingHours.forEach(async (day) => {
        const operatingHoursRef = ref(db, `operatingHours/${placeID}/${day.dayOfWeek}`);
        await set(operatingHoursRef, {
          // dayOfWeek: day.dayOfWeek,
          isOpen: day.isOpen,
          openingTime: day.isOpen ? day.openingTime : 'null',
          closingTime: day.isOpen ? day.closingTime : null,
        });
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
        title="Attraction name :"
        value={form.name}
        handleChangeText={(e) => setForm({ ...form, name: e })}      />
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
        <CreateForm 
        title="Website Link (if any) :"
        value={form.websiteLink}
        handleChangeText={(e) => setForm({ ...form, websiteLink: e })}
        keyboardType="url"
        />
        <CreateForm 
        title="Contact Number :"
        value={form.contactNum}
        handleChangeText={(e) => setForm({ ...form, contactNum: e })}
        keyboardType="phone-pad"
        />
          {/* Operating Hours with Open/Close toggle */}
        <View className="w-full">
        {form.operatingHours.map(({ dayOfWeek, isOpen, openingTime, closingTime }) => (
          <View key={dayOfWeek} className="mb-5 flex-row w-full justify-start">
            <View className="flex-row items-center w-1/3 justify-start mb-2">
              <Text className="text-base font-semibold w-1/3">{dayOfWeek}</Text>
              <Switch 
                value={isOpen}
                onValueChange={() => handleToggleDayOpen(dayOfWeek)}
                label={isOpen ? 'Open' : 'Close'}
              />
            </View>

            {isOpen && (
              <View className="flex-row justify-evenly items-center">
                <TimeField
                  value={openingTime}
                  handleChangeText={(time) => handleChangeOpeningTime(dayOfWeek, time)}
                />
                <Text className="mx-3">-</Text>
                <TimeField
                  value={closingTime}
                  handleChangeText={(time) => handleChangeClosingTime(dayOfWeek, time)}
                />
              </View>
            )}
          </View>
        ))}
        </View>
        {/* Admission Type Section */}
        <View className="mb-5">
          <Text className="font-kregular text-xl">Admission Type:</Text>
          <View className="flex-row items-center mt-2">
            {/* Free Admission */}
            <TouchableOpacity
              onPress={() => handleAdmissionTypeChange('free')}
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
            >
              <View
                style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: '#A91D1D',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 8,
                }}
              >
                {form.admissionType === 'free' && (
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
              <Text>Free Admission</Text>
            </TouchableOpacity>

            {/* Paid Admission */}
            <TouchableOpacity
              onPress={() => handleAdmissionTypeChange('paid')}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <View
                style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: '#A91D1D',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 8,
                }}
              >
                {form.admissionType === 'paid' && (
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
              <Text>Paid Admission</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Conditional Price Section */}
        {form.admissionType === 'paid' && (
          <View className="mb-5">
            <Text className="font-kregular text-xl">Upload Price Details:</Text>
            <AddPhoto
              isMultiple={true}
              images={priceImages}
              setImages={setPriceImages} // Pass the state setters to AddPhoto
              isLoading={isSubmitting}
            />
          </View>
        )}
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

export default CreateAttraction