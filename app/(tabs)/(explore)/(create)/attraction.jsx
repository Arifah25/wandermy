import { View, Text, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AddPhoto, Button, CreateForm, TimeField, } from '../../../../components'
import { useRouter } from 'expo-router'
import { getDatabase, ref, push, set } from "firebase/database";
import { getAuth } from 'firebase/auth'

const CreateAttraction = () => {
  
  // Use the useRouter hook to get the router object for navigation
  const router = useRouter();

  //database and get user ID
  const db = getDatabase();
  const auth = getAuth();
  const userId = auth.currentUser.uid;

  // Initialize state variables for attributes in attraction
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
      { dayOfWeek: 'SUN', openingTime: '9:00', closingTime: '22:00' },
      { dayOfWeek: 'MON', openingTime: '9:00', closingTime: '22:00' },
      { dayOfWeek: 'TUE', openingTime: '9:00', closingTime: '22:00' },
      { dayOfWeek: 'WED', openingTime: '9:00', closingTime: '22:00' },
      { dayOfWeek: 'THU', openingTime: '9:00', closingTime: '22:00' },
      { dayOfWeek: 'FRI', openingTime: '9:00', closingTime: '22:00' },
      { dayOfWeek: 'SAT', openingTime: '9:00', closingTime: '22:00' },
    ],
  });

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
      router.back();
      } catch (error) {
        console.error(error);
        setIsSubmitting(false);
    }
  };
  
  return (
    // <SafeAreaView>
      <ScrollView
      className="flex-1 h-full px-8 bg-white"
      >
        <View
        className="my-5"
        >
          <Text
          className="font-kregular text-xl"
          >
            Poster :
          </Text>
          {/* image picker for poster */}
          <AddPhoto />
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
          handlePress={() => router.push("(tabs)/(explore)/(create)/location")}
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

        {form.operatingHours.map(({ dayOfWeek, openingTime, closingTime }) => (
          <View key={dayOfWeek} className="flex-row justify-evenly items-center mb-7">
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
        <View
        className="mb-5"
        >
          <Text
          className="font-kregular text-xl"
          >
            Price :
          </Text>
          {/* image picker for poster */}
          <AddPhoto />
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