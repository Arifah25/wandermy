import { View, Text, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, CreateForm, TimeField, } from '../../../../components'
import { useRouter } from 'expo-router'

const CreateAttraction = () => {
  
  // Use the useRouter hook to get the router object for navigation
  const router = useRouter();

  // Initialize state variables for attributes in attraction
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
      { dayOfWeek: 'SUN', openingTime: '', closingTime: '' },
      { dayOfWeek: 'MON', openingTime: '', closingTime: '' },
      { dayOfWeek: 'TUE', openingTime: '', closingTime: '' },
      { dayOfWeek: 'WED', openingTime: '', closingTime: '' },
      { dayOfWeek: 'THU', openingTime: '', closingTime: '' },
      { dayOfWeek: 'FRI', openingTime: '', closingTime: '' },
      { dayOfWeek: 'SAT', openingTime: '', closingTime: '' },
    ],
  });
  
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

  return (
    <SafeAreaView
    className="flex-1 justify-center"
    >
      <ScrollView
      className="h-full px-8 "
      >
        <View
        className="mb-5"
        >
          <Text
          className="font-kregular text-xl"
          >
            Poster :
          </Text>
          {/* image picker for poster */}
        </View>
        <CreateForm 
        title="Attraction name :"
        value={form.name}
        handleChangeText={(e) => setForm({ ...form, name: e })}      />
        <View
        className="items-center mb-5"
        >
          <CreateForm
          title="Location :"
          value={form.address}
          handleChangeText={(e) => setForm({ ...form, address: e })}        />
          {/* pin location */}
          <Button 
          title="Pin Location"
          handlePress={() => router.push("(tabs)/(explore)/(create)/location")}
          style="bg-secondary w-full"
          textColor="text-black"
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
        </View>
        <CreateForm 
        title="Tags :"
        value={form.contactNum}
        handleChangeText={(e) => setForm({ ...form, contactNum: e })}
        keyboardType="default"
        tags="true"
        />
        <View
        className="flex-row items-center justify-evenly my-5">
          <Button 
          title="Cancel"
          handlePress={() => router.push("(auth)/sign-up")}
          style="bg-secondary w-2/5"
          textColor="text-primary"
          />
          <Button 
          title="POST"
          handlePress={() => router.push("(auth)/sign-up")}
          style="bg-primary w-2/5"
          textColor="text-white"/>
        </View>
      </ScrollView>      
    </SafeAreaView>
  )
}

export default CreateAttraction