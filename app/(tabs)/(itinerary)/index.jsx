import { View, Text, Image, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TouchableOpacity } from 'react-native'
import { icons } from '../../../constants'
import { ItineraryCard } from '../../../components'
import { useRouter } from 'expo-router'

const Itinerary = () => {
  const router = useRouter();
  const [itinerary, setItinerary] = useState([]);

  return (
    <View
    className="bg-white h-full flex-1 p-5 justify-start"
    >
         
       {itinerary?.length==0?
       (<View>
        <Text className="text-xl font-kregular text-black">
          Itineraries
        </Text>
        <ScrollView className="h-full pb-10">
          <ItineraryCard />

        </ScrollView>
       </View>
       ):(<View>
        <Text
        className="text-secondary font-kregular text-2xl text-center">
          Let's Create {"\n"}Your First Itinerary
        </Text>
       </View>)
       }
       <TouchableOpacity
        className=" absolute bottom-5 right-5 bg-primary p-4 rounded-full shadow-sm shadow-black"
        onPress={() => router.push("(tabs)/(itinerary)/(create-itinerary)/new")}
      >
        <Image source={icons.plus} tintColor="#fff" className="w-7 h-7"/>
      </TouchableOpacity> 
    </View>
  )
}

export default Itinerary