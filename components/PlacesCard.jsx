import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'; // Import Image from expo-image

const PlaceCard = ({ image, name, handlePress }) => {
  return (
    <TouchableOpacity onPress={handlePress} style={{ width: '48%', marginBottom: 10 }}>
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
          contentFit="cover" // Maintain aspect ratio and fill
          cachePolicy="memory-disk" // Enable caching for better performance
          onError={(error) => console.log('Image Load Error:', error)} // Log any errors
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


export default PlaceCard