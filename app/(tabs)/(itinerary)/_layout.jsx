import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { icons } from '../../../constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Itinerary from './index';
import { useRouter } from 'expo-router';

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
        name="Itinerary Crafting"
        component={Itinerary}
        options={{ 
          headerTitle: 'Itinerary Crafting',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
        }}
      />
    </Stack.Navigator>
  )
}

export default ItineraryLayout