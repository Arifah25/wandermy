import { View, Text, Image } from 'react-native'
import React from 'react'
import { images } from "../constants";

const Poster = ({uri}) => {
  return (
    <View className=" bg-secondary rounded-lg">
      <Image source={uri}
      className="w-[335px] h-[200px] rounded-lg"
       />
      
    </View>
  )
}

export default Poster