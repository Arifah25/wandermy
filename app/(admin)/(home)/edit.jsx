import { View, Text, ScrollView, Modal, Switch, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'; // Correct hook for search params
import { AddPhoto, Button, CreateForm, Map, DateField, TimeField, } from '../../../components'
import { getDatabase, ref, onValue, push, set, get, remove } from "firebase/database";
import { getAuth } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRoute, useNavigation } from '@react-navigation/native';


const Edit = () => {
  
  // Use the useRouter hook to get the router object for navigation
  const router = useRouter();
  const route = useRoute();
  //database and get user ID
  const db = getDatabase();
  const auth = getAuth();
  const { placeID, category  } = route.params;
  // const { latitude, longitude, address } = useLocalSearchParams(); // Use the correct hook

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");  
  const [websiteLink, setWebsiteLink] = useState("");
  const [contactNum, setContactNum] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [placeData, setPlaceData] = useState(null);
  const [startDate, setStartDate] = useState({});
  const [endDate, setEndDate] = useState({});  
  const [startTime, setStartTime] = useState({});
  const [endTime, setEndTime] = useState({});
  const [operatingHours, setOperatingHours] = useState([]);
  // Initialize state variables for attributes in attraction
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      { dayOfWeek: 'MON', isOpen: true, openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'TUE', isOpen: true, openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'WED', isOpen: true, openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'THU', isOpen: true, openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'FRI', isOpen: true, openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'SAT', isOpen: true, openingTime: '9:00 AM', closingTime: '10:00 PM' },
      { dayOfWeek: 'SUN', isOpen: true, openingTime: '9:00 AM', closingTime: '10:00 PM' },
    ],
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
  });

  // Fetch operating hours
  useEffect(() => {
    const hourRef = ref(db, `operatingHours/${placeID}`);
  
  onValue(hourRef, (snapshot) => {
    const data = snapshot.val();

    // Initialize an empty array to hold the sorted hours
    const sortedHours = [];

    // Iterate over the orderedDays array and pick the corresponding data from the snapshot
    orderedDays.forEach((day) => {
      if (data && data[day]) {
        sortedHours.push({
          dayOfWeek: day,
          ...data[day],
        });
      } else {
        sortedHours.push({
          dayOfWeek: day,
          isOpen: false,
          openingTime: null,
          closingTime: null,
        });
      }
    });

    setOperatingHours(sortedHours); // Now the operating hours are in the correct order
  });
}, [placeID]);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const eventRef = ref(db, `event/${placeID}`);
      const snapshot = await get(eventRef);
      const eventData = snapshot.exists() ? snapshot.val() : {};
      setEvent(eventData);
      setLoading(false);
    };

    if (category === 'event') fetchEvent();
  }, [placeID, category]);

  // Store selected images in state
  const [posterImages, setPosterImages] = useState([]);
  const [priceImages, setPriceImages] = useState([]);

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

  useEffect(() => {
    if (placeID) {
      const placeRef = ref(db, `places/${placeID}`);
      get(placeRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setPlaceData(data);
          setName(data.name);
          setAddress(data.address);
          setLatitude(data.latitude);
          setLongitude(data.longitude);
          setWebsiteLink(data.websiteLink);
          setPosterImages(data.posterImages);
          setContactNum(data.contactNum);
          setTags(data.tags);
          setPriceImages(data.priceImages);
          setDescription(data.description);
          
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
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
        name: name || placeData.name,
        address: address || placeData.address,
        latitude: latitude || placeData.latitude,
        longitude: longitude || placeData.longitude,
        websiteLink: websiteLink || placeData.websiteLink,
        contactNum: contactNum || placeData.contactNum,
        poster: posterImages || placeData.posterImages, // Use uploaded URLs
        price_or_menu: priceImages || placeData.priceImages,
        tags: tags || placeData.tags,
        description : description || placeData.description,
      };

      await set(placeRef, placeData);

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
  // <ScrollView className="flex-1 h-full px-8 bg-white">
  //   <Modal
  //     visible={isModalVisible}
  //     transparent={true}
  //     animationType="fade"
  //   >
  //     <Map 
  //       onLocationSelected={handleLocationSelected}
  //       confirmButtonText="Set Location"
  //       placeholderText="Select your preferred location on the map"
  //     />
  //   </Modal>
  //   <View className="my-5">
  //     <Text className="font-kregular text-xl">Poster :</Text>
  //     {/* image picker for poster */}
  //     <AddPhoto
  //       images={posterImages}
  //       setImages={setPosterImages} // Pass the state setters to AddPhoto
  //       isLoading={isSubmitting}
  //     />
  //   </View>
    
  //   (category === 'attraction' ? (true) : 
      
  //     <CreateForm 
  //         title="Attraction name :"
  //         value={name}
  //         handleChangeText={(value) => setForm({ ...form, name: value })}      />
  //     <View className="items-center mb-5">
  //       <CreateForm
  //           title="Address :"
  //           value={address}
  //           tags="true"
  //           handleChangeText={(value) => setForm({ ...form, address: value })}       
  //       />
  //       {/* pin location */}
  //       <Button 
  //         title="Pin Location"
  //         handlePress={handleMap}
  //         style="bg-secondary w-full"
  //         textColor="text-black ml-5"
  //         location="true"
  //       />
  //     </View>

  //     <CreateForm 
  //       title="Website Link (if any) :"
  //       value={websiteLink}
  //       handleChangeText={(value) => setForm({ ...form, websiteLink: value })}
  //       keyboardType="url"
  //     />

  //     <CreateForm 
  //       title="Contact Number :"
  //       value={contactNum}
  //       handleChangeText={(value) => setForm({ ...form, contactNum: value })}
  //       keyboardType="phone-pad"
  //     />

  //     {/* Operating Hours with Open/Close toggle */}
  //     <View className="w-full">
  //       {operatingHours.map(({ dayOfWeek, isOpen, openingTime, closingTime }) => (
  //         <View key={dayOfWeek} className="mb-5 flex-row w-full justify-start">
  //           <View className="flex-row items-center w-1/3 justify-start mb-2">
  //             <Text className="text-base font-semibold w-1/3">{dayOfWeek}</Text>
  //             <Switch 
  //               value={isOpen}
  //               onValueChange={() => handleToggleDayOpen(dayOfWeek)}
  //               label={isOpen ? 'Open' : 'Close'}
  //             />
  //           </View>

  //           {isOpen && (
  //             <View className="flex-row justify-evenly items-center">
  //               <TimeField
  //                 value={openingTime}
  //                 handleChangeText={(time) => handleChangeOpeningTime(dayOfWeek, time)}
  //               />
  //               <Text className="mx-3">-</Text>
  //               <TimeField
  //                 value={closingTime}
  //                 handleChangeText={(time) => handleChangeClosingTime(dayOfWeek, time)}
  //               />
  //             </View>
  //           )}
  //         </View>
  //       ))}
  //       </View>
  //       <View className="mb-5">
  //         <Text className="font-kregular text-xl">
  //           Price :
  //         </Text>
  //         {/* image picker for price */}
  //         <AddPhoto
  //           isMultiple={true}
  //           images={priceImages}
  //           setImages={setPriceImages} // Pass the state setters to AddPhoto
  //           isLoading={isSubmitting}
  //         />

  //     </View>
  //     <CreateForm 
  //       title="Tags :"
  //       value={tags}
  //       handleChangeText={(value) => setForm({ ...form, tags: value })}
  //       keyboardType="default"
  //       tags="true"
  //     />
  //     <View className="flex-row items-center justify-evenly mt-5 mb-10">
  //       <Button 
  //         title="Cancel"
  //         handlePress={() => router.back()}
  //         style="bg-secondary w-2/5"
  //         textColor="text-primary"
  //       />
  //       <Button 
  //         title="POST"
  //         handlePress={handlePost}
  //         style="bg-primary w-2/5"
  //         textColor="text-white"
  //       />
  //     </View>

  //   category === 'dining' ? (true) :
  //     <CreateForm 
  //         title="Restaurant name :"
  //         value={name}
  //         handleChangeText={(value) => setForm({ ...form, name: value })}      />
  //     <View className="items-center mb-5">
  //       <CreateForm
  //         title="Address :"
  //         value={address}
  //         tags="true"
  //         handleChangeText={(value) => setForm({ ...form, address: value })}       
  //       />
  //       {/* pin location */}
  //       <Button 
  //         title="Pin Location"
  //         handlePress={handleMap}
  //         style="bg-secondary w-full"
  //         textColor="text-black ml-5"
  //         location="true"
  //       />
  //     </View>
  //     <CreateForm 
  //       title="Website Link (if any) :"
  //       value={websiteLink}
  //       handleChangeText={(value) => setForm({ ...form, websiteLink: value })}
  //       keyboardType="url"
  //     />
  //     <CreateForm 
  //       title="Contact Number :"
  //       value={contactNum}
  //       handleChangeText={(value) => setForm({ ...form, contactNum: value })}
  //       keyboardType="phone-pad"
  //     />
  //     {/* Operating Hours with Open/Close toggle */}
  //     <View className="w-full">
  //       {operatingHours.map(({ dayOfWeek, isOpen, openingTime, closingTime }) => (
  //         <View key={dayOfWeek} className="mb-5 flex-row w-full justify-start">
  //           <View className="flex-row items-center w-1/3 justify-start mb-2">
  //             <Text className="text-base font-semibold w-1/3">{dayOfWeek}</Text>
  //             <Switch 
  //               value={isOpen}
  //               onValueChange={() => handleToggleDayOpen(dayOfWeek)}
  //               label={isOpen ? 'Open' : 'Close'}
  //             />
  //           </View>

  //           {isOpen && (
  //             <View className="flex-row justify-evenly items-center">
  //               <TimeField
  //                 value={openingTime}
  //                 handleChangeText={(time) => handleChangeOpeningTime(dayOfWeek, time)}
  //               />
  //               <Text className="mx-3">-</Text>
  //               <TimeField
  //                 value={closingTime}
  //                 handleChangeText={(time) => handleChangeClosingTime(dayOfWeek, time)}
  //               />
  //             </View>
  //           )}
  //         </View>
  //       ))}
  //     </View>
  //     <View className="mb-5">
  //       <Text className="font-kregular text-xl">
  //         Menu :
  //       </Text>
  //       {/* image picker for price */}
  //       <AddPhoto
  //         isMultiple={true}
  //         images={priceImages}
  //         setImages={setPriceImages} // Pass the state setters to AddPhoto
  //         isLoading={isSubmitting}
  //       />
  //     </View>

  //     <CreateForm 
  //       title="Tags :"
  //       value={tags}
  //       handleChangeText={(value) => setForm({ ...form, tags: value })}
  //       keyboardType="default"
  //       tags="true"
  //     />
  //     <View className="flex-row items-center justify-evenly mt-5 mb-10">
  //       <Button 
  //         title="Cancel"
  //         handlePress={() => router.back()}
  //         style="bg-secondary w-2/5"
  //         textColor="text-primary"
  //       />
  //       <Button 
  //         title="POST"
  //         handlePress={handlePost}
  //         style="bg-primary w-2/5"
  //         textColor="text-white"
  //       />
  //     </View>
      
  //   category === 'event' ? (true):
  //   <CreateForm 
  //         title="Event name :"
  //         value={name}
  //         handleChangeText={(value) => setForm({ ...form, name: value })}      />

  //     <View className="mb-5">
  //       <Text className="font-kregular text-xl">
  //           When does the event start and end ? 
  //       </Text>
  //       <View className="flex-row justify-start my-5 items-center">
  //         <Text className="w-14 text-lg font-kregular">
  //           Date :
  //         </Text>
  //         <View className="w-4/5 flex-row justify-evenly">
  //           <DateField 
  //             placeholder="Start Date"
  //             value={startDate}
  //             handleChangeText={(value) => setForm({ ...form, startDate: value })}
  //             />
  //             <DateField 
  //             placeholder="End Date"
  //             value={endDate}
  //             handleChangeText={(value) => setForm({ ...form, endDate: value })}
  //           />
  //         </View>
  //       </View>
  //       <View className="flex-row justify-start items-center">
  //         <Text className="w-14 text-lg font-kregular">
  //           Time :
  //         </Text>
  //         <View className="w-4/5 flex-row justify-evenly">
  //           <TimeField 
  //             placeholder="Start Time"
  //             value={startTime}
  //             handleChangeText={(value) => setForm({ ...form, startTime: value })}
  //           />
  //           <TimeField 
  //             placeholder="End Time"
  //             value={endTime}
  //             handleChangeText={(value) => setForm({ ...form, endTime: value })}
  //           />
  //         </View>
  //       </View>
  //     </View>

  //     <View className="items-center mb-5">
  //       <CreateForm
  //         title="Address :"
  //         value={address}
  //         tags="true"
  //         handleChangeText={(value) => setForm({ ...form, address: value })}       
  //       />
  //         {/* pin location */}
  //       <Button 
  //         title="Pin Location"
  //         handlePress={handleMap}
  //         style="bg-secondary w-full"
  //         textColor="text-black ml-5"
  //         location="true"
  //       />
  //     </View>

  //     <View className="mb-5">
  //       <Text className="font-kregular text-xl">
  //         Ticket Price :
  //       </Text>
  //       {/* image picker for price */}
  //       <AddPhoto
  //         isMultiple={true}
  //         images={priceImages}
  //         setImages={setPriceImages} // Pass the state setters to AddPhoto
  //         isLoading={isSubmitting}
  //       />
  //     </View>
      
  //     <CreateForm 
  //       title="Contact Number :"
  //       value={contactNum}
  //       handleChangeText={(value) => setForm({ ...form, contactNum: value })}
  //       keyboardType="phone-pad"
  //     />

  //     <CreateForm
  //       title="Description of the event :" 
  //       value={description}
  //       handleChangeText={(value) => setForm({ ...form, description: value })}
  //       keyboardType="default"
  //       tags="true"
  //     /> 
        
  //     <CreateForm 
  //       title="Tags :"
  //       value={tags}
  //       handleChangeText={(value) => setForm({ ...form, tags: value })}
  //       keyboardType="default"
  //       tags="true"
  //     />
  //     <View className="flex-row items-center justify-evenly mt-5 mb-10">
  //       <Button 
  //         title="Cancel"
  //         handlePress={() => router.back()}
  //         style="bg-secondary w-2/5"
  //         textColor="text-primary"
  //       />
  //       <Button 
  //         title="POST"
  //         handlePress={handlePost}
  //         style="bg-primary w-2/5"
  //         textColor="text-white"/>
  //     </View> 
  //     (false))
  // </ScrollView> 
  console.log("edit page")
)  
}

export default Edit