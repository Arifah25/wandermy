import { View, Text, TouchableOpacity, Alert, Modal, Switch } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'; // Correct hook for search params
import { AddPhoto, Button, CreateForm, Map, TimeField, } from '../../../../components'
import { getDatabase, ref, push, set } from "firebase/database";
import { getAuth } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const CreateDining = () => {
  
  // Use the useRouter hook to get the router object for navigation
  const router = useRouter();
  const { latitude, longitude, address } = useLocalSearchParams(); // Use the correct hook

  //database and get user ID
  const db = getDatabase();
  const auth = getAuth();
  const userId = auth.currentUser.uid;

  // Initialize state variables for attributes in dining
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
    halalStatus: '',
    facilities: [],
    tags: '',
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
  const [errors, setErrors] = useState({});
  const facilitiesList = ['Surau', 'WiFi', 'Parking', 'Toilet'];

  const handleFacilityToggle = (facility) => {
    setForm((prevForm) => {
      const facilities = prevForm.facilities.includes(facility)
        ? prevForm.facilities.filter((item) => item !== facility)
        : [...prevForm.facilities, facility];
      return { ...prevForm, facilities };
    });
  };

  const uploadImages = async (images, folderName) => {
    const storage = getStorage();
    const uploadedUrls = [];
    
    for (const uri of images) {
      const storageRef1 = storageRef(storage, `places/dining/${placeID}/${folderName}/${new Date().toISOString()}`);
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
  
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.address.trim()) newErrors.address = 'Address is required.';
    if (!form.contactNum.trim()) newErrors.contactNum = 'Contact number is required.';
    if (!posterImages.length) newErrors.poster = 'At least one poster is required.';
    if (!form.tags.trim()) newErrors.tags = 'Tags are required.';
    if (!form.halalStatus.trim()) newErrors.halalStatus = 'Halal status is required.'; // Validate Halal status
    // if (!form.facilities.length) newErrors.facilities = 'At least one facility is required.';

    form.operatingHours.forEach((day) => {
      if (day.isOpen && (!day.openingTime || !day.closingTime)) {
        newErrors.operatingHours = 'Operating hours must be set for open days.';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    // Validate required fields
    if (!validateForm()) {
      Alert.alert(
        "Incomplete Form",
        "Please fill in all required fields before submitting.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload images and get the URLs
      const posterUrls = await uploadImages(posterImages, 'poster');
      const priceUrls = await uploadImages(priceImages, 'menu');

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
        category: 'dining',
        status: 'pending',
        halalStatus: form.halalStatus,
        user: userId,
        facilities: form.facilities,
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
  
  const renderError = (field) => {
    return errors[field] ? <Text style={{ color: 'red', fontSize: 12 }}>{errors[field]}</Text> : null;
  };

  return (
    <KeyboardAwareScrollView
          className="flex-1 h-full px-8 bg-white"
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
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

        <View className="mt-5">
          <Text className="font-kregular text-xl">Poster* :</Text>
          <AddPhoto
            images={posterImages}
            setImages={setPosterImages}
            isLoading={isSubmitting}
          />
          {renderError('poster')}
        </View>

        <CreateForm 
        title="Restaurant name* :"
        value={form.name}
        handleChangeText={(e) => setForm({ ...form, name: e })}
        error={errors.name}      
        />

        <View className="mt-3">
          <Text className="font-kregular text-xl">Halal Status* :</Text>
          <View className="flex-row mt-2">
            <TouchableOpacity
              onPress={() => setForm({ ...form, halalStatus: 'Halal' })}
              style={{
                backgroundColor: form.halalStatus === 'Halal' ? '#A91D1D' : '#F5F5F5',
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 16,
                marginRight: 10,
              }}
            >
              <Text style={{ color: form.halalStatus === 'Halal' ? '#FFF' : '#000' }}>Halal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setForm({ ...form, halalStatus: 'Non-Halal' })}
              style={{
                backgroundColor: form.halalStatus === 'Non-Halal' ? '#A91D1D' : '#F5F5F5',
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ color: form.halalStatus === 'Non-Halal' ? '#FFF' : '#000' }}>Non-Halal</Text>
            </TouchableOpacity>
          </View>
        {renderError('halalStatus')}
      </View>

        
        <CreateForm
          title="Address* :"
          value={form.address}
          tags="true"
          handleChangeText={(e) => setForm({ ...form, address: e })}
          error={errors.address}
        />
        <Button
            title="Pin Location"
            handlePress={() => setIsModalVisible(true)}
            style="bg-secondary w-full mt-2"
            textColor="text-black ml-5"
            location="true"
          />

        <CreateForm 
          title="Website Link (if any) :"
          value={form.websiteLink}
          handleChangeText={(e) => setForm({ ...form, websiteLink: e })}
          keyboardType="url"
        />

        <CreateForm 
        title="Contact Number* :"
        value={form.contactNum}
        handleChangeText={(e) => setForm({ ...form, contactNum: e })}
        keyboardType="phone-pad"
        error={errors.contactNum}
        />

          {/* Operating Hours with Open/Close toggle */}
        <View className="w-full mt-4">
          <Text className="font-kregular text-xl mb-3">
            Operating Hours* :
          </Text>
        {form.operatingHours.map(({ dayOfWeek, isOpen, openingTime, closingTime }) => (
          <View key={dayOfWeek} className="mb-3 flex-row w-full justify-start">
            <View className="flex-row items-center w-1/3 justify-start mb-1">
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
        {renderError('operatingHours')}
        </View>

        <View>
          <Text className="font-kregular text-xl">
            Menu :
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
        title="Tags* :"
        value={form.tags}
        handleChangeText={(e) => setForm({ ...form, tags: e })}
        keyboardType="default"
        tags="true"
        error={errors.tags}
        />

        <View className="mb-5 mt-3">
          <Text className="font-kregular text-xl">Facilities (if any) :</Text>
          <View className="flex-row flex-wrap mt-2">
            {facilitiesList.map((facility) => (
              <TouchableOpacity
                key={facility}
                onPress={() => handleFacilityToggle(facility)}
                style={{
                  backgroundColor: form.facilities.includes(facility) ? '#A91D1D' : '#F5F5F5',
                  borderRadius: 20,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  marginRight: 10,
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: form.facilities.includes(facility) ? '#FFF' : '#000' }}>
                  {facility}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="flex-row items-center justify-evenly mt-5 mb-10">
          <Button 
            title="Cancel"
            handlePress={() => router.back()}
            style="bg-secondary w-2/5"
            textColor="text-primary"
          />
          <Button 
            title="Submit"
            handlePress={handlePost}
            style="bg-primary w-2/5"
            textColor="text-white"/>
        </View>
      </KeyboardAwareScrollView>      
    // </SafeAreaView>
  )
}

export default CreateDining