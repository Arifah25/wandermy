import { View, Text, Image } from 'react-native'
import React from 'react'
import { icons, images } from "../constants";

const Poster = ({
  image
}) => {
  return (
    <View className=" bg-secondary rounded-lg">
      <Image 
      source={{ uri: image }}
      // source={images.logo}
      className="w-full h-[200px] rounded-lg"
       />
      
    </View>
  )
}

export default Poster