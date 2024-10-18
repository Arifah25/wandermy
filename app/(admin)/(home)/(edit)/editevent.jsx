import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Image, ScrollView, TextInput, Switch, TouchableOpacity, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { AddPhoto, CreateForm, Button, Map, TimeField, DateField } from '../../../../components';
import { icons } from '../../../../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDatabase, ref, set, get, update } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker'; // to pick images
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

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
          setDescription(data.description);
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
          setStartDate(data.startDate);
          setEndDate(data.endDate);
          setStartTime(data.startTime);
          setEndTime(data.endTime);
          console.log("Start Date:", data.startDate);
          console.log("End Date:", data.endDate);
          console.log("Start Time:", data.startTime);
          console.log("End Time:", data.endTime);
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

      const storageReference = storageRef(storage, `places/event/${placeID}/poster`);
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

      const storageReference = storageRef(storage, `places/event/${placeID}/poster`);
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

  
  const updateDetail = async () => {
    if (!placeID) return;

    let posterURL = await Promise.all(
      poster.map(async (imgUri) => await uploadPoster(placeID, imgUri))
    );
  
    // Handle uploading all price/menu images
    let priceOrMenuURL = await Promise.all(
      price_or_menu.map(async (imgUri) => await uploadPrice_Or_Menu(placeID, imgUri))
    );

    // Update Firebase Realtime Database with new data
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
    };

    try {
      const userRef = ref(db, `places/${placeID}`);
      await update(userRef, updates);

      // Show a success message or navigate the user
      console.log("Detail updated successfully.");
      // router.push(`(admin)/(home)/details/${placeID}`); // nak change to updated detail page
      router.back();
    } catch (error) {
      console.error("Error updating detail:", error);
    }
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
    // <SafeAreaView>
    <ScrollView className="flex-1 h-full px-8 bg-white">
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
          Poster :
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
      </View>
        
      <View className="my-2">
        <Text className="font-kregular text-xl mb-2">Event Name : </Text>
        <View className="w-full bg-white rounded-md h-10 justify-center border-2 border-secondary">
          <TextInput
            className="font-pregular p-2"
            value={name} // Controlled input
            placeholder="Enter event name"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setName(value)}
          />
        </View>
      </View>

      <View className="my-2">
        <Text className="font-kregular text-xl mb-2">Address :</Text>
        <View className="w-full bg-white rounded-md h-32 justify-center border-2 border-secondary">
          <TextInput
            className="font-pregular p-2 h-32"
            value={address} // Controlled input
            placeholder="Enter address"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setAddress(value)}
            multiline={true}
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
        <Text className="font-kregular text-xl mb-2">
          When does the event start and end ? 
        </Text>
        <View className="flex-row justify-start my-5 items-center">
          <Text className="w-14 text-lg font-kregular">
            Date :
          </Text>
          <View className="w-4/5 flex-row justify-evenly">
            <DateField 
            className="font-pregular p-2"
            value={startDate} // Controlled input
            placeholder="Start Date"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setStartDate(value)}
            />

            <DateField 
            className="font-pregular p-2"
            value={endDate} // Controlled input
            placeholder="End Date"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setEndDate(value)}
            />
          </View>
        </View>
        <View className="flex-row justify-start items-center">
          <Text className="w-14 text-lg font-kregular">
              Time :
          </Text>
          <View className="w-4/5 flex-row justify-evenly">
            <TimeField 
            className="font-pregular p-2"
            value={startTime} // Controlled input
            placeholder="Start Time"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setStartTime(value)}
            />
            <TimeField 
            className="font-pregular p-2"
            value={endTime} // Controlled input
            placeholder="End Time"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setEndTime(value)}
            />
          </View>
        </View>
      </View> 

      <View className="my-2">
        <Text className="font-kregular text-xl mb-2">Contact Number : </Text>
        <View className="w-full bg-white rounded-md h-10 justify-center border-2 border-secondary">
          <TextInput
            className="font-pregular p-2"
            value={contactNum} // Controlled input
            placeholder="Enter Contact Number"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setContactNum(value)}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View className="my-2">
        <Text className="font-kregular text-xl mb-2">Description of the event :  </Text>
        <View className="w-full bg-white rounded-md h-10 justify-center border-2 border-secondary">
          <TextInput
            className="font-pregular p-2"
            value={description} // Controlled input
            placeholder="Enter description"
            placeholderTextColor="#7E6C6C"
            onChangeText={(value) => setTags(value)}
            keyboardType="default"
            tags="true"
          />
        </View>
      </View>

      <View className="my-5">
        <Text className="font-kregular text-xl">
          Ticket Fee :
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
    </ScrollView>      
    // </SafeAreaView>
  )
}

export default EditEvent;