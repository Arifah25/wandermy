import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, Text, Image, ScrollView, TextInput, Switch, TouchableOpacity, Modal, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { AddPhoto, CreateForm, Button, Map, TimeField, DateField } from '../../../../components';
import { icons } from '../../../../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDatabase, ref, set, get, update } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker'; // to pick images
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const EditEvent = () => {
  const db = getDatabase();
  const route = useRoute();
  const router = useRouter();
  const { placeID } = route.params || {};
  // console.log("Received placeID in EditAttraction:", placeID);  
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [contactNum, setContactNum] = useState("");  
  const [address, setAddress] = useState("");  
  const [poster, setPoster] = useState([]);
  const [price_or_menu, setPrice_Or_Menu] = useState([]);
  const [tags, setTags] = useState("");
  const [longitude, setLongitude] = useState();
  const [latitude, setLatitude] = useState();
  const [description, setDescription] = useState([]);
  const [startDate, setStartDate] = useState([]);
  const [endDate, setEndDate] = useState([]);
  const [startTime, setStartTime] = useState([]);
  const [endTime, setEndTime] = useState([]);
  const [admissionType, setAdmissionType] = useState(''); // State for admission type
  const [feeAmount, setFeeAmount] = useState(''); // State for fee amount (if paid)
  const [facilities, setFacilities] = useState(['Surau', 'WiFi', 'Parking', 'Toilet']);
  const [errors, setErrors] = useState({});

  const [placeData, setPlaceData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    address: '',
    contactNum: '',
    price_or_menu: [],
    poster: [], 
    tags: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '', 
    admissionType: '',
    feeAmount: '',
    facilities: []
  });
  
  const [form, setForm] = useState({
    name: '',
    latitude: '',
    longitude: '',
    address: '',
    contactNum: '',
    price_or_menu: [],
    poster: [],
    tags: '', 
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    admissionType: '',
    feeAmount: '',
    facilities: []
  });

  useEffect(() => {
    if (placeID) {
      // Fetch place data
      const placeRef = ref(db, `places/${placeID}`);
      get(placeRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("Fetched place data:", data); 
          setPlaceData(data);
          setName(data.name);
          setContactNum(data.contactNum);
          setPoster(data.poster);
          setPrice_Or_Menu(data.price_or_menu);
          setAddress(data.address);
          setLongitude(data.longitude);
          setLatitude(data.latitude);
          setTags(data.tags);
          setFacilities(data.facilities || []);
          setDescription(data.description);
          setAdmissionType(data.admissionType); // Set admission type
          setFeeAmount(data.feeAmount || ''); // Set fee amount if paid
        } else {
          console.log("No place data available");
        }
      }).catch((error) => {
        console.error("Error fetching place data:", error);
      });
    }
  
    if (placeID) {
      // Fetch event data
      const eventRef = ref(db, `event/${placeID}`);
      get(eventRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("Fetched event data:", data); 
          setForm({
            ...form,
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            startTime: data.startTime || '',
            endTime: data.endTime || '',
          });
        } else {
          console.log("No event data available");
        }
      }).catch((error) => {
        console.error("Error fetching event data:", error);
      });
    }
  }, [placeID]);

 
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

  const uploadPoster = async (placeID, selectedImage) => {
    try {
      const storage = getStorage();
      const fileUri = selectedImage;

      const response = await fetch(fileUri);
      const blob = await response.blob();

      const storageReference = storageRef(storage, `places/event/${placeID}/poster/${new Date().toISOString()}`);
      await uploadBytes(storageReference, blob);

      const posterURL = await getDownloadURL(storageReference);
      return posterURL;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
  };

  const handleFacilityToggle = (facility) => {
    setFacilities((prevFacilities) => {
      const isSelected = prevFacilities.includes(facility);
      if (isSelected) {
        return prevFacilities.filter((item) => item !== facility); // Remove facility
      }
      return [...prevFacilities, facility]; // Add facility
    });
  };

  const handleChangePoster = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      selectionLimit: 0, // Set to 0 for unlimited selection
    });

    if (!result.canceled) {
      setPoster(result.assets[0].uri); // Save the URI of the selected image
    }
  };

  //price uploading
  const uploadPrice_Or_Menu = async (placeID, selectedImage) => {
    try {
      const storage = getStorage();
      const fileUri = selectedImage;

      const response = await fetch(fileUri);
      const blob = await response.blob();

      const storageReference = storageRef(storage, `places/event/${placeID}/price/${new Date().toISOString()}`);
      await uploadBytes(storageReference, blob);

      const price_or_menuURL = await getDownloadURL(storageReference);
      return price_or_menuURL;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
  };

  const handleChangePrice_Or_Menu = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      selectionLimit: 0, // Set to 0 for unlimited selection
    });

    if (!result.canceled) {
      setPrice_Or_Menu(result.assets[0].uri); // Save the URI of the selected image
    }
  };


  const handleMap = () => {
    toggleModalVisibility();
  };

  const toggleModalVisibility = () => {
    setIsModalVisible(!isModalVisible);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.address.trim()) newErrors.address = 'Address is required.';
    if (!form.contactNum.trim()) newErrors.contactNum = 'Contact number is required.';
    if (!poster.length) newErrors.poster = 'At least one poster is required.';
    if (!form.tags.trim()) newErrors.tags = 'Tags are required.';
    if (!form.description.trim()) newErrors.description = 'Description is required.';
    if (!form.startDate.trim()) newErrors.startDate = 'Start date is required.';
    if (!form.endDate.trim()) newErrors.endDate = 'End date is required.';
    if (!form.startTime.trim()) newErrors.startTime = 'Start time is required.';
    if (!form.endTime.trim()) newErrors.endTime = 'End time is required.';
    if (!form.admissionType) newErrors.admissionType = 'Admission type is required.';

    // form.operatingHours.forEach((day) => {
    //   if (day.isOpen && (!day.openingTime || !day.closingTime)) {
    //     newErrors.operatingHours = 'Operating hours must be set for open days.';
    //   }
    // });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateDetail = async () => {
    try {
      console.log("Entered updateDetail");
  
      console.log("Starting poster upload...");
  
      let posterURL = await Promise.all(
        poster.map(async (imgUri) => await uploadPoster(placeID, imgUri))
      );
      console.log("Poster URLs:", posterURL);
  
      let priceOrMenuURL = await Promise.all(
        price_or_menu.map(async (imgUri) => await uploadPrice_Or_Menu(placeID, imgUri))
      );
      console.log("Price/Menu URLs:", priceOrMenuURL);
  
      const updates = {
        name: name || placeData.name,
        contactNum: contactNum || placeData.contactNum,
        address: address || placeData.address,
        longitude: longitude || placeData.longitude,
        latitude: latitude || placeData.latitude,
        tags: tags || placeData.tags,
        poster: posterURL || placeData.poster,
        price_or_menu: priceOrMenuURL || placeData.price_or_menu,
        description: description || placeData.description,
        startDate: startDate || placeData.startDate,
        endDate: endDate || placeData.endDate,
        startTime: startTime || placeData.startTime,
        endTime: endTime || placeData.endTime,
        admissionType: admissionType || placeData.admissionType,
        feeAmount: admissionType === 'paid' ? feeAmount : null,
      };
  
      console.log("Updates object:", updates);
  
      const userRef = ref(db, `places/${placeID}`);
      await update(userRef, updates);
      console.log("Firebase update successful");
      Alert.alert('Success', 'Details updated successfully!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      console.error("Error in updateDetail:", error);
      Alert.alert('Error', 'An error occurred during the update.', [{ text: 'OK' }]);
    } finally {
      setIsSubmitting(false); // Hide loading indicator
    }
  };
  
  
  // const updateDetail = async () => {
  //   if (!validateForm()) {
  //     Alert.alert('Incomplete Form', 'Please fill in all required fields before updating.', [{ text: 'OK' }]);
  //     return;
  //   }
  
  //   setIsSubmitting(true);
  //   console.log("Updating details for placeID:", placeID);
  
  //   try {
  //     // Upload poster and price/menu images
  //     let posterURL = await Promise.all(
  //       poster.map(async (imgUri) => {
  //         const url = await uploadPoster(placeID, imgUri);
  //         console.log("Uploaded Poster URL:", url);
  //         return url;
  //       })
  //     );
  
  //     let priceOrMenuURL = await Promise.all(
  //       price_or_menu.map(async (imgUri) => {
  //         const url = await uploadPrice_Or_Menu(placeID, imgUri);
  //         console.log("Uploaded Price/Menu URL:", url);
  //         return url;
  //       })
  //     );
  
  //     // Construct update object
  //     const updates = {
  //       name: name || placeData.name,
  //       contactNum: contactNum || placeData.contactNum,
  //       address: address || placeData.address,
  //       longitude: longitude || placeData.longitude,
  //       latitude: latitude || placeData.latitude,
  //       tags: tags || placeData.tags,
  //       poster: posterURL || placeData.poster,
  //       price_or_menu: priceOrMenuURL || placeData.price_or_menu,
  //       description: description || placeData.description,
  //       startDate: startDate || placeData.startDate,
  //       endDate: endDate || placeData.endDate,
  //       startTime: startTime || placeData.startTime,
  //       endTime: endTime || placeData.endTime,
  //       admissionType: admissionType || placeData.admissionType,
  //       feeAmount: admissionType === 'paid' ? feeAmount : null,
  //     };
  //     console.log("Update data:", updates);
  
  //     const userRef = ref(db, `places/${placeID}`);
  //     await update(userRef, updates);
  
  //     Alert.alert('Success', 'Details updated successfully!', [{ text: 'OK', onPress: () => router.back() }]);
  //   } catch (error) {
  //     console.error('Error updating detail:', error);
  //     Alert.alert('Error', 'An error occurred while updating. Please try again.', [{ text: 'OK' }]);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
  

  const renderError = (field) => {
    return errors[field] ? <Text style={{ color: 'red', fontSize: 12 }}>{errors[field]}</Text> : null;
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
  

  
  return (
    <KeyboardAwareScrollView
      className="flex-1 h-full px-8 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
    >      
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
      <View className="my-5">
        <Text className="font-kregular text-xl">
          Poster* :
        </Text>
        <TouchableOpacity onPress={handleChangePoster} className="items-center">
          <Image
            source={poster ? { uri: poster } : icons.profile}       
          />
        </TouchableOpacity>
        
        {/* image picker for poster   */}
        <AddPhoto
        images={poster}
        setImages={setPoster} // Pass the state setters to AddPhoto
        isLoading={isSubmitting}
        />
        {renderError('poster')}
      </View>
        
      <View className="my-2">
        <Text className="font-kregular text-xl mb-2">Event Name* : </Text>
        <View className="w-full bg-white rounded-md h-10 justify-center border-2 border-secondary">
          <TextInput
            className="font-pregular p-2"
            value={name} // Controlled input
            placeholder="Enter event name"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setName(value)}
            error={errors.name}
          />
        </View>
      </View>

      <View className="my-2">
        <Text className="font-kregular text-xl mb-2">Address* :</Text>
        <View className="w-full bg-white rounded-md h-32 justify-center border-2 border-secondary">
          <TextInput
            className="font-pregular p-2 h-32"
            value={address} // Controlled input
            placeholder="Enter address"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setAddress(value)}
            multiline={true}
            error={errors.address}
          />
        </View>
      </View>
 
      <View className="items-center mb-5">
        {/* pin location */}
        <Button 
        title="Pin Location"
        handlePress={handleMap}
        style="bg-secondary w-full"
        textColor="text-black ml-5"
        location="true"
        />
      </View> 

      {/* when start and end*/}
      <View className="mb-5">
  <View className="flex-row justify-start my-5 items-center">
    <Text className="w-14 text-lg font-kregular">Date:</Text>
    <View className="w-4/5 flex-row justify-evenly">
      <DateField
        placeholder="Start Date"
        value={form.startDate} // Controlled by state
        handleChangeText={(e) => setForm({ ...form, startDate: e })}
        error={errors.startDate}
      />
      <DateField
        placeholder="End Date"
        value={form.endDate} // Controlled by state
        handleChangeText={(e) => setForm({ ...form, endDate: e })}
        error={errors.endDate}
      />
    </View>
  </View>

  <View className="flex-row justify-start items-center">
    <Text className="w-14 text-lg font-kregular">Time:</Text>
    <View className="w-4/5 flex-row justify-evenly">
      <TimeField
        placeholder="Start Time"
        value={form.startTime} // Controlled by state
        handleChangeText={(e) => setForm({ ...form, startTime: e })}
      />
      <TimeField
        placeholder="End Time"
        value={form.endTime} // Controlled by state
        handleChangeText={(e) => setForm({ ...form, endTime: e })}
      />
    </View>
  </View>
</View>


      <View className="my-2">
        <Text className="font-kregular text-xl mb-2">Contact Number* : </Text>
        <View className="w-full bg-white rounded-md h-10 justify-center border-2 border-secondary">
          <TextInput
            className="font-pregular p-2"
            value={contactNum} // Controlled input
            placeholder="Enter Contact Number"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setContactNum(value)}
            keyboardType="phone-pad"
            error={errors.contactNum}
          />
        </View>
      </View>

      <View className="my-2">
        <Text className="font-kregular text-xl mb-2">Description of the event* :  </Text>
        <View className="w-full bg-white rounded-md h-10 justify-center border-2 border-secondary">
          <TextInput
            className="font-pregular p-2"
            value={description} // Controlled input
            placeholder="Enter description"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setTags(value)}
            keyboardType="default"
            tags="true"
            error={errors.description}
          />
        </View>
      </View>

      {/* Radio Buttons for Admission Type */}
      <View className="mb-5">
        <Text className="font-kregular text-xl">Admission Type*:</Text>
        <View className="flex-row items-center mt-2">
          <TouchableOpacity
            onPress={() => setAdmissionType('free')}
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
              {admissionType === 'free' && (
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
            onPress={() => setAdmissionType('paid')}
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
              {admissionType === 'paid' && (
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
        {errors.admissionType && (
          <Text style={{ color: 'red', fontSize: 12, marginTop: 5 }}>
            {errors.admissionType}
          </Text>
        )}
      </View>

      {/* Fee Amount Input if Paid */}
      {admissionType === 'paid' && (
        <View className="mb-5">
          <Text className="font-kregular text-xl">Fee Amount:</Text>
          <TextInput
            className="font-pregular p-2 border-2 border-secondary rounded-md"
            value={feeAmount}
            placeholder="Enter fee amount"
            onChangeText={(value) => setFeeAmount(value)} // Updates feeAmount correctly
            keyboardType="default"
          />
        </View>
      )}

      <View className="my-5"> 
        <Text className="font-kregular text-xl">
          More Details :
        </Text>
        <TouchableOpacity onPress={handleChangePrice_Or_Menu} className="items-center">
          <Image
            source={price_or_menu ? { uri: price_or_menu } : icons.profile}       
          />
        </TouchableOpacity>
        
        {/* image picker for poster   */}
          <AddPhoto
          isMultiple={true}
          images={price_or_menu}
          setImages={setPrice_Or_Menu} // Pass the state setters to AddPhoto
          isLoading={isSubmitting}
        />
      </View>

      <View className="my-2">
        <Text className="font-kregular text-xl mb-2">Tags :  </Text>
        <View className="w-full bg-white rounded-md h-10 justify-center border-2 border-secondary">
          <TextInput
            className="font-pregular p-2"
            value={tags} // Controlled input
            placeholder="Enter tags"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setTags(value)}
            keyboardType="default"
            tags="true"
          />
        </View>
      </View>
      {/* Facilities Section */}
      <View className="flex-row flex-wrap mt-2">
        {['Surau', 'WiFi', 'Parking', 'Toilet'].map((facility) => (
          <TouchableOpacity
            key={facility}
            onPress={() => handleFacilityToggle(facility)}
            style={{
              backgroundColor: facilities.includes(facility) ? '#A91D1D' : '#F5F5F5',
              borderRadius: 20,
              paddingVertical: 8,
              paddingHorizontal: 16,
              marginRight: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: facilities.includes(facility) ? '#FFF' : '#000' }}>
              {facility}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
         
      <View className="flex-row items-center justify-evenly mt-5 mb-10">
        <Button 
        title="Cancel"
        handlePress={() => router.back()}
        style="bg-secondary w-2/5"
        textColor="text-primary"
        />
        <Button 
        title="Update"
        handlePress={() => {
          console.log("Update button pressed");
          updateDetail();
        }}
        style="bg-primary w-2/5"
        textColor="text-white"/>
      </View>
    </KeyboardAwareScrollView>
  )
}

export default EditEvent;