import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { icons } from '../../../constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Itinerary from './index';
import NewItinerary from './new';
import { useRouter } from 'expo-router';
import Search from './search';


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
        name="new"
        component={NewItinerary}
        options={{ 
          headerTitle: 'Itinerary Crafting',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />
      <Stack.Screen
        name="search"
        component={Search}
        options={{ 
          headerTitle: 'Itinerary Crafting',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />
    </Stack.Navigator>

  )
}

export default ItineraryLayout