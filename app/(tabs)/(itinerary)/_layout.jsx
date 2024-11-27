import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { icons } from '../../../constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';

import Itinerary from './index';

import MyItinerary from './itinerary';
import CreateItineraryLayout from './(create-itinerary)/_layout';

const Stack = createNativeStackNavigator();

const HeaderIcon = ({ onPress, icon }) => (
  <TouchableOpacity onPress={onPress} style={{ margin: 10 }}>
    <Image source={icon} style={{ width: 24, height: 24, tintColor: '#fff' }} />
  </TouchableOpacity>
);

const ItineraryLayout = () => {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="index"
        component={Itinerary}
        options={{ 
          headerTitle: 'Itinerary Crafting',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
          // headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />      
      <Stack.Screen
        name="itinerary"
        component={MyItinerary}
        options={{ 
          headerTitle: 'Itinerary Crafting',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
          // headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />    
      <Stack.Screen
      name="(create-itinerary)"
      component={CreateItineraryLayout}
      options={{ 
        headerShown: false,
      }}
      />
    </Stack.Navigator>

  )
}

export default ItineraryLayout