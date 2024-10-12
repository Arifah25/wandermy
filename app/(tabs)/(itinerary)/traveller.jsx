import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import { SelectTravelList } from "../../../constants/option";
import { OptionCard } from '../../../components';

const Traveller = () => {
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
          <View className="">
            <OptionCard 
             option={item}
            />
          </View>
        )}
        />
      </View>
    </View>
  )
}

export default Traveller