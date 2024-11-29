import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { icons } from '@/constants'
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const ItineraryCard = ({
    itinerary,
}) => {
  return (
    <View className="border-b-2 border-secondary">
        <View 
        className="flex-row items-center w-full justify-evenly  py-4" 
        >
            <View className="w-10">
                <AntDesign name="calendar" size={24} color="black" />
            </View>
            <TouchableOpacity className="w-3/4">
            <Text
            className="text-base font-kregular"
            >
                Summer trip 
            </Text>
            </TouchableOpacity>
            <TouchableOpacity className="">
            <MaterialIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
            
        </View>
    </View>
  )
}

export default ItineraryCard