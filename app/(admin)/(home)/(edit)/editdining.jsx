import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Image, ScrollView, TextInput, Switch, TouchableOpacity, Modal, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { AddPhoto, CreateForm, Button, Map, TimeField } from '../../../../components';
import { icons } from '../../../../constants';
import { getDatabase, ref, set, get, update } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const EditDining = () => {
  const db = getDatabase();
  const route = useRoute();
  const router = useRouter();
  const { placeID } = route.params || {};
  console.log("Received placeID in EditDining:", placeID);  
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [contactNum, setContactNum] = useState("");  
  const [address, setAddress] = useState("");  
  const [poster, setPoster] = useState([]);
  const [price_or_menu, setPrice_Or_Menu] = useState([]);
  const [tags, setTags] = useState("");
  const [longitude, setLongitude] = useState();
  const [latitude, setLatitude] = useState();
  const [operatingHours, setOperatingHours] = useState([]);
  const [facilities, setFacilities] = useState(['Surau', 'WiFi', 'Parking', 'Toilet']);
  const [halalStatus, setHalalStatus] = useState("");
  const [errors, setErrors] = useState({});
  
  const [placeData, setPlaceData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    address: '',
    websiteLink: '',
    contactNum: '',
    price_or_menu: [],
    poster: [],
    tags: '',
    halalStatus: '',
    facilities: [],
    operatingHours: [],
  });
  
  const [form, setForm] = useState({
    name: '',
    latitude: '',
    longitude: '',
    address: '',
    websiteLink: '',
    contactNum: '',
    price_or_menu: [],
    poster: [], 
    tags: '',
    halalStatus: '',
    facilities: [],
    operatingHours: [
      { dayOfWeek: 'MON', isOpen: false, openingTime: '', closingTime: '' },
      { dayOfWeek: 'TUE', isOpen: false, openingTime: '', closingTime: '' },
      { dayOfWeek: 'WED', isOpen: false, openingTime: '', closingTime: '' },
      { dayOfWeek: 'THU', isOpen: false, openingTime: '', closingTime: '' },
      { dayOfWeek: 'FRI', isOpen: false, openingTime: '', closingTime: '' },
      { dayOfWeek: 'SAT', isOpen: false, openingTime: '', closingTime: '' },
      { dayOfWeek: 'SUN', isOpen: false, openingTime: '', closingTime: '' },
    ],
  });

  useEffect(() => {
    if (placeID) {
      const userRef = ref(db, `places/${placeID}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("Fetched data:", data); 
          setPlaceData(data);
          setName(data.name || "");
          setWebsiteLink(data.websiteLink || "");
          setContactNum(data.contactNum || "");
          setPoster(data.poster || []);
          setPrice_Or_Menu(data.price_or_menu || []);
          setAddress(data.address || "");
          setLongitude(data.longitude || "");
          setLatitude(data.latitude || "");
          setTags(data.tags);
          setHalalStatus(data.halalStatus || "");
          setFacilities(data.facilities || []);
          setOperatingHours(data.operatingHours || []);
          // console.log("Poster Images:", data.poster); // Log poster images
          // console.log("Price Images:", data.price_or_menu); // Log price images

        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });
    }
  }, [placeID]);

  const handleFacilityToggle = (facility) => {
    setFacilities((prevFacilities) => {
      const isSelected = prevFacilities.includes(facility);
      if (isSelected) {
        return prevFacilities.filter((item) => item !== facility); // Remove facility
      }
      return [...prevFacilities, facility]; // Add facility
    });
  };

  useEffect(() => {
    const fetchOperatingHours = async () => {
      try {
        const operatingHoursRef = ref(db, `operatingHours/${placeID}`);
        const snapshot = await get(operatingHoursRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const updatedOperatingHours = form.operatingHours.map(day => ({
            ...day,
            isOpen: data[day.dayOfWeek]?.isOpen || false,
            openingTime: data[day.dayOfWeek]?.openingTime || '',
            closingTime: data[day.dayOfWeek]?.closingTime || '',
          }));
          setForm({ operatingHours: updatedOperatingHours });
        }
      } catch (error) {
        console.error("Error fetching operating hours: ", error);
      }
    };

    fetchOperatingHours();
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

      const storageReference = storageRef(storage, `places/dining/${placeID}/poster/${new Date().toISOString()}`);
      await uploadBytes(storageReference, blob);

      const posterURL = await getDownloadURL(storageReference);
      return posterURL;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
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
      console.error("Error uploading picture:", error);
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
    if (!form.halalStatus.trim()) newErrors.halalStatus = 'Halal status is required.';

    form.operatingHours.forEach((day) => {
      if (day.isOpen && (!day.openingTime || !day.closingTime)) {
        newErrors.operatingHours = 'Operating hours must be set for open days.';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateDetail = async () => {
    setIsSubmitting(true);
  
    try {
      // Upload poster images
      let posterURL = await Promise.all(
        poster.map(async (imgUri) => await uploadPoster(placeID, imgUri))
      );
  
      // Upload price/menu images
      let priceOrMenuURL = await Promise.all(
        price_or_menu.map(async (imgUri) => await uploadPrice_Or_Menu(placeID, imgUri))
      );
  
      // Construct updates object
      const updates = {
        name: name || placeData.name,
        websiteLink: websiteLink || placeData.websiteLink || "",
        contactNum: contactNum || placeData.contactNum || "",
        address: address || placeData.address || "",
        longitude: longitude || placeData.longitude || "",
        latitude: latitude || placeData.latitude || "",
        tags: tags || placeData.tags || "",
        halalStatus: halalStatus || placeData.halalStatus,
        facilities: facilities || placeData.facilities || [],
        poster: posterURL.length > 0 ? posterURL : placeData.poster || [],
        price_or_menu: priceOrMenuURL.length > 0 ? priceOrMenuURL : placeData.price_or_menu || [],
      };
  
      // Update Firebase
      const userRef = ref(db, `places/${placeID}`);
      await update(userRef, updates);
  
      // Save operating hours
      form.operatingHours.forEach(async (day) => {
        const operatingHoursRef = ref(db, `operatingHours/${placeID}/${day.dayOfWeek}`);
        await set(operatingHoursRef, {
          isOpen: day.isOpen,
          openingTime: day.isOpen ? day.openingTime : null,
          closingTime: day.isOpen ? day.closingTime : null,
        });
      });
  
      Alert.alert('Success', 'Details updated successfully!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      console.error('Error updating detail:', error);
      Alert.alert('Error', 'An error occurred while updating. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsSubmitting(false);
    }
  };  

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
        isLoading={isSubmitting}/>
        {renderError('poster')}
      </View>
        
        <View className="my-2">
          <Text className="font-kregular text-xl mb-2">Restaurant Name* : </Text>
          <View className="w-full bg-white rounded-md h-10 justify-center border-2 border-secondary">
            <TextInput
              className="font-pregular p-2"
              value={name} // Controlled input
              placeholder="Enter restaurant name"
              placeholderTextColor="#7E6C6C"
              onChangeText={(value) => setName(value)}
              error={errors.name}
            />
          </View>
        </View>

        <View className="mt-3">
          <Text className="font-kregular text-xl">Halal Status* :</Text>
          <View className="flex-row mt-2">
            <TouchableOpacity
              onPress={() => setHalalStatus('Halal')}
              style={{
                backgroundColor: halalStatus === 'Halal' ? '#A91D1D' : '#F5F5F5',
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 16,
                marginRight: 10,
              }}
            >
              <Text style={{ color: halalStatus === 'Halal' ? '#FFF' : '#000' }}>Halal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setHalalStatus('Non-Halal')}
              style={{
                backgroundColor: halalStatus === 'Non-Halal' ? '#A91D1D' : '#F5F5F5',
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ color: halalStatus === 'Non-Halal' ? '#FFF' : '#000' }}>Non-Halal</Text>
            </TouchableOpacity>
          </View>
          {renderError('halalStatus')}
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

      <View className="my-2">
        <Text className="font-kregular text-xl mb-2">Website Link (if any) : </Text>
        <View className="w-full bg-white rounded-md h-10 justify-center border-2 border-secondary">
          <TextInput
            className="font-pregular p-2"
            value={websiteLink} // Controlled input
            placeholder="Enter website link"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setWebsiteLink(value)}
            keyboardType="url"
          />
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
      

      {/* operatinghours */}
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

      <View className="my-5">
        <Text className="font-kregular text-xl">
          Menu :
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
            error={errors.tags}
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
        handlePress={updateDetail}
        style="bg-primary w-2/5"
        textColor="text-white"/>
      </View>
    </KeyboardAwareScrollView>
  )
}
  
  export default EditDining;
  