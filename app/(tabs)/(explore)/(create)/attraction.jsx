import { View, Text, ScrollView, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'; // Correct hook for search params
import { AddPhoto, Button, CreateForm, Map, TimeField, } from '../../../../components'
import { getDatabase, ref, push, set } from "firebase/database";
import { getAuth } from 'firebase/auth'

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
    operatingHours: [
      { dayOfWeek: 'SUN', openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'MON', openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'TUE', openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'WED', openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'THU', openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'FRI', openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'SAT', openingTime: '9:00 AM', closingTime: '10:00 PM' },
    ],
  });

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

  const handlePost = async () => {
    setIsSubmitting(true);
    try {
      const placeData = {
        placeID,
        name: form.name,
        latitude: form.latitude,
        longitude: form.longitude,
        address: form.address,
        websiteLink: form.websiteLink,
        contactNum: form.contactNum,
        poster: form.poster,
        price_or_menu: form.poster,
        tags: form.tags,
        category: 'attraction',
        status: 'pending',
        user: userId,
      };
      await set(newPlaceRef, placeData);

      // Save opening hours
      const operatingHoursRef = ref(db, `operatingHours/${placeID}`);
      form.operatingHours.forEach(async (day) => {
        const newOpeningHourRef = push(operatingHoursRef);
        await set(newOpeningHourRef, {
          dayOfWeek: day.dayOfWeek,
          openingTime: day.openingTime,
          closingTime: day.closingTime,
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
    console.log('Selected Location:', locationData);
    
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
            placeID={placeID} 
            folderName="poster"
            handlePress={handlePosterImagePicked}
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
        {/* Operating Hours */}

        <View className="">
          {form.operatingHours.map(({ dayOfWeek, openingTime, closingTime }) => (
            <View key={dayOfWeek} className=" flex-row justify-evenly items-center mb-7">
              <Text className="text-base font-semibold w-10">{dayOfWeek}</Text>
              <View className="flex-row items-center">
                <TimeField
                  value={openingTime}
                  handleChangeText={(time) => handleChangeOpeningTime(dayOfWeek, time)}
                />
                <Text className="w-10 align-middle text-center text-base font-semibold">-</Text>
                <TimeField
                  value={closingTime}
                  handleChangeText={(time) => handleChangeClosingTime(dayOfWeek, time)}
                />
              </View>
            </View>
          ))}
        </View>
        <View
        className="mb-5"
        >
          <Text
          className="font-kregular text-xl"
          >
            Price :
          </Text>
          {/* image picker for poster */}
          <AddPhoto
            placeID={placeID} 
            folderName="price"
            handlePress={handlePriceImagesPicked}
            isMultiple={true}
            isLoading={isSubmitting}
          />

        </View>
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
          handlePress={() => router.push('/index')}
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