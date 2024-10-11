import { View, Text, TextInput } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, DateField, SearchPlace } from '../../../components';
import 'react-native-get-random-values';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const NewItinerary = () => {
    const router = useRouter();
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
        className="w-11/12 border-2 border-secondary rounded-md mt-5 h-16 p-3 justify-center focus:border-black">
          <TextInput
          className="font-kregular text-base h-14 "
          placeholder="e.g, Semester Break Trip"
          placeholderTextColor="#7E6C6C"
          // onChangeText={}
          />
        </View>
      </View>
      <View
      className="w-full items-center mt-7">
        <Text
        className="font-kregular text-xl">
          Select A Destination
        </Text>
        <View className="h-32 w-full items-center ">
          <SearchPlace />        
        </View>        
      </View> 
      <View
      className="w-full items-center mt-7">
        <Text
        className="font-kregular text-xl mb-5">
          Select Trip Dates
        </Text>
        <View
        className="w-full flex-row mt-5 items-center justify-around">
          <DateField 
          placeholder="Start"/>
          <DateField
          placeholder="End"/>
        </View>
      </View>  
      <Button 
      title="Start Crafting"
      textColor="text-white"
      style="bg-primary my-20 w-3/5"
      handlePress={() => router.push('/search')}
      />        
    </View>
  )
}

export default NewItinerary