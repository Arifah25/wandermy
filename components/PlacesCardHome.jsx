import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { icons, images } from "../constants";

const PlaceCardHome = ({ image, name, handlePress }) => {
  return (
    <TouchableOpacity onPress={handlePress} style={{ width: '100%', marginBottom: 10 }}>
      <View
        style={{
          width: '100%',
          backgroundColor: '#F2F2F2',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri: image }}
          style={{
            width: '100%',
            height: 150, // Fixed height for consistent card display
          }}
          resizeMode="cover"
        />
        <View style={{ 
          padding: 10, 
          alignItems: 'center',
          height: 60, // Fixed height for the text container
          justifyContent: 'center'
          }}>
          <Text
            className='text-center text-base font-kregular'
            style={{
              fontSize: 15,
              color: '#333',
              textAlign: 'center',
              lineHeight: 20,
              fontWeight: 'bold',
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};


export default PlaceCardHome
