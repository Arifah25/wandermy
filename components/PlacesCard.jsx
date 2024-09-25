import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { icons, images } from "../constants";

const PlaceCard = ({
  image, 
  name,
  handlePress
}) => {
  return (    
    <TouchableOpacity
    onPress={handlePress}
    >
      <View className="w-40 rounded-lg bg-secondary border items-center justify-start">
        <View
        className="bg-white w-full items-center h-36 justify-center rounded-t-lg">
          <Image 
          // source={{ uri: image }}
            source={icons.bookmark}
          />
        </View>
        <View
        className="h-[62px] items-center justify-center">
          <Text
          className="p-2 text-center text-base font-kregular">
            {name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
    
  )
}

export default PlaceCard