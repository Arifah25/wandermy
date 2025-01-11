import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { icons, images } from "../constants";

const PlaceCard = ({image, name, handlePress}) => {
  return (    
    <TouchableOpacity onPress={handlePress} 
    style={{ width: '48%', marginBottom: 10 }}
    >
      <View className="w-40 rounded-lg bg-secondary border items-center justify-start">
        <View className="bg-white w-full items-center h-36 justify-center rounded-t-lg">
          <Image 
           source={{ uri: image }}
            // source={images.logo}
            className="bg-white w-full items-center h-36 justify-center rounded-t-lg"
          />
        </View>
        <View className="h-[62px] items-center justify-center" style={{
            paddingHorizontal: 8, // Add padding to create gap from the sides
          }}>
          <Text
            className="text-center text-base font-kregular"
            style={{
              marginTop: 5,
              textAlign: 'center',
              fontSize: 15,
              color: '#333',
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
    
  )
}

export default PlaceCard