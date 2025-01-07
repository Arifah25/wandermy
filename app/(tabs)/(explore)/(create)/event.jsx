import { View, Text, ScrollView, Modal, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'; // Correct hook for search params
import { AddPhoto, Button, CreateForm, DateField, Map, TimeField, } from '../../../../components'
import { getDatabase, ref, push, set } from "firebase/database";
import { getAuth } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
    facilities: [], 
    tags: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    admissionType: 'free', // Default is Free Admission
    feeAmount: '', // Fee amount field
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
  
  const handleAdmissionTypeChange = (type) => {
    setForm((prevForm) => ({
      ...prevForm,
      admissionType: type,
      feeAmount: type === 'free' ? '' : prevForm.feeAmount, // Clear feeAmount if 'free'
    }));
  };
  
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
  

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.address.trim()) newErrors.address = 'Address is required.';
    if (!form.contactNum.trim()) newErrors.contactNum = 'Contact number is required.';
    if (!posterImages.length) newErrors.poster = 'At least one poster is required.';
    if (!form.tags.trim()) newErrors.tags = 'Tags are required.';
    if (!form.description.trim()) newErrors.description = 'Description is required.';
    if (!form.admissionType.trim()) newErrors.admissionType = 'Choose admission type.';
    if (!form.startDate.trim()) newErrors.startDate = 'Start date is required.';
    if (!form.endDate.trim()) newErrors.endDate = 'End date is required.';
    // if (!form.facilities.length) newErrors.facilities = 'At least one facility is required.';

  //   form.operatingHours.forEach((day) => {
  //     if (day.isOpen && (!day.openingTime || !day.closingTime)) {
  //       newErrors.operatingHours = 'Operating hours must be set for open days.';
  //     }
  //   }
  // );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePost = async () => {
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
        admissionType: form.admissionType,
        facilities: form.facilities,
        feeAmount: form.admissionType === 'paid' ? form.feeAmount : 'Free',
      };
      await set(newPlaceRef, placeData);

      // Save event date and time
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

  const renderError = (field) => {
    return errors[field] ? <Text style={{ color: 'red', fontSize: 12 }}>{errors[field]}</Text> : null;
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
          <Text className="font-kregular text-xl">Poster :</Text>
          {/* image picker for poster */}
          <AddPhoto
            images={posterImages}
            setImages={setPosterImages} // Pass the state setters to AddPhoto
            isLoading={isSubmitting}
          />
          {renderError('poster')}
        </View>
        
        <CreateForm 
        title="Event name :"
        value={form.name}
        handleChangeText={(e) => setForm({ ...form, name: e })} 
        error={errors.name}     
        />

        <CreateForm
          title="Description of the event :" 
          value={form.description}
          handleChangeText={(e) => setForm({ ...form, description: e })}
          keyboardType="default"
          tags="true"
          error={errors.description}
        /> 

        <View className="mb-5">
          {/* <Text className="font-kregular text-xl">
            When does the event start and end ? 
          </Text> */}
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
              error={errors.startDate}
              />
              <DateField 
              placeholder="End Date"
              value={form.endDate}
              handleChangeText={(e) => setForm({ ...form, endDate: e })}
              error={errors.endDate}
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
        
        <CreateForm 
          title="Contact Number :"
          value={form.contactNum}
          handleChangeText={(e) => setForm({ ...form, contactNum: e })}
          keyboardType="phone-pad"
          error={errors.contactNum}
        />

        <CreateForm
          title="Address :"
          value={form.address}
          tags="true"
          handleChangeText={(e) => setForm({ ...form, address: e })} 
          error={errors.address}      
        />
          {/* pin location */}
        <Button 
          title="Pin Location"
          handlePress={handleMap}
          style="bg-secondary w-full mt-2"
          textColor="text-black ml-5"
          location="true"
        />

        {/* Radio Buttons for Admission Type */}
        <View className="mb-5 mt-5">
          <Text className="font-kregular text-xl">Admission Type:</Text>
          <View className="flex-row items-center mt-2">
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

        {/* Conditional Fee Amount Input */}
        {form.admissionType === 'paid' && (
          <View className="mb-5">
            <CreateForm
              title="Fee Amount:"
              value={form.feeAmount}
              handleChangeText={(e) => setForm({ ...form, feeAmount: e })}
              keyboardType="default"
            />
          </View>
        )}
        
        <View >
          <Text className="font-kregular text-xl">
            Infographics (Optional) :
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
        title="Tags :"
        value={form.tags}
        handleChangeText={(e) => setForm({ ...form, tags: e })}
        keyboardType="default"
        tags="true"
        error={errors.tags}
        />

        <View className="mb-5 mt-4">
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

        <View
        className="flex-row items-center justify-evenly mt-5 mb-10">
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
  )
}

export default CreateEvent