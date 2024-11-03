import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Button, OptionCard } from '../../../../components';
import { useNavigation, useRouter } from 'expo-router';
import { CreateItineraryContext } from '../../../../context/CreateItineraryContext';
import { SelectTravelList } from '../../../../constants/option';

const SelectTraveler = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [selectedTraveler, setSelectedTraveler] = useState();
  const {itineraryData, setItineraryData} = useContext(CreateItineraryContext);

  // useEffect(()=>{
  //   navigation.setOptions({
  //     headerShown: true,
  //     // headerTransparent: true,
  //     headerTitle:'Test'
  //   })
  // },[])
  
  useEffect(() =>{
    setItineraryData({...itineraryData,
      traveler: selectedTraveler
    })
  },[selectedTraveler])

  return (
    <View
    className="bg-white flex-1 p-5 h-full items-center justify-start"
    >
      <Text
      className="text-3xl font-ksemibold"
      >
        Who's Travelling
      </Text>
      <Text
      className="font-kregular text-lg"
      >
        Choose your traveller
      </Text>
      <View className="w-full mt-5">
        <FlatList
        data={SelectTravelList}
        renderItem={({item, index}) => (
          <View className="items-center">
            <TouchableOpacity
            onPress={() => setSelectedTraveler(item)}
            >
              <OptionCard 
              option={item}
              selected={selectedTraveler}
              />
            </TouchableOpacity>
          </View>
        )}
        />
      </View>
      <Button
      title="Next"
      textColor="text-white"
      style="bg-primary w-3/4 mt-5"
      handlePress={() => router.push('(tabs)/(itinerary)/(create-itinerary)/date')}
      />
    </View>
  )
}

export default SelectTraveler