import { View, Text, TextInput } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, DateField, SearchPlace } from '../../../../components';
import 'react-native-get-random-values';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { CreateItineraryContext } from '../../../../context/CreateItineraryContext';

const NewItinerary = () => {
    const router = useRouter();
    const { itineraryData, setItineraryData } = useContext(CreateItineraryContext);

    //Initialize state variables for attributes in event 
    const [tripName, setTripName] = useState(''); 
    
    const handleTripNameChange = (value) => {
      setTripName(value);
      setItineraryData((prevData) => ({
        ...prevData,
        tripName: value,
      }));
    };

  return (
    <View
    className="bg-white flex-1 p-5 h-full items-center justify-start"
    >
      <Text
      className="font-kregular text-2xl">
        Let's craft our itinerary !
      </Text>
      <View
      className="w-full items-center mt-7">
        <Text
        className="font-kregular text-xl">
          Trip Name
        </Text>
        <View
        className="w-11/12 border-2 border-secondary rounded-md mt-5 h-14 p-3 justify-center focus:border-black">
          <TextInput
          className="font-kregular text-base h-14 "
          placeholder="e.g, Semester Break Trip"
          placeholderTextColor="#7E6C6C"
          value={tripName}
          onChangeText={handleTripNameChange}
          />
        </View>
      </View>
      <View
      className="w-full items-center mt-7">
        <Text
        className="font-kregular text-xl">
          Select A Destination
        </Text>
        <View className="w-full h-14 items-center mt-5 z-50"> 
          <SearchPlace 
          />  
        </View>      
      </View> 
      {/* <View
      className="w-full items-center mt-7">
        <Text
        className="font-kregular text-xl">
          Select Trip Dates
        </Text>
        <View
        className="w-full flex-row mt-5 items-center justify-around">
          <DateField 
          placeholder="Start Date"
          value={form.startDate}
          handleChangeText={(e) => setForm({ ...form, startDate: e })}
          />
          <DateField 
          placeholder="End Date"
          value={form.endDate}
          handleChangeText={(e) => setForm({ ...form, endDate: e })}
          />
        </View>
      </View>   */}
      <Button 
      title="Start Crafting"
      textColor="text-white"
      style="bg-primary my-10 w-3/5"
      handlePress={() => router.push('(tabs)/(itinerary)/(create-itinerary)/traveler')}
      />        
    </View>
  )
}

export default NewItinerary