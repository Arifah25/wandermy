import { View, Text, TextInput } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, DateField, Search } from '../../../components';

const NewItinerary = () => {
    const router = useRouter();
  return (
    <SafeAreaView
    className=" bg-white flex-1 px-5 h-full items-center justify-center"
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
          className="font-kregular text-base "
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
        
      </View> 
      <View
      className="w-full items-center mt-7">
        <Text
        className="font-kregular text-xl">
          Select Trip Dates
        </Text>
        <View
        className="w-full flex-row mt-5 items-center justify-evenly">
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
      // handlePress={() => router.push('')}
      />        
    </SafeAreaView>
  )
}

export default NewItinerary