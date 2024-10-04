import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import CreateAttraction from './attraction';
import CreateDining from './dining';
import CreateEvent from './event';
import { icons } from '../../../constants';

const Stack = createNativeStackNavigator();

const HeaderIcon = ({ onPress, icon }) => (
  <TouchableOpacity onPress={onPress} style={{ margin: 10 }}>
    <Image source={icon} style={{ width: 24, height: 24, tintColor: '#fff' }} />
  </TouchableOpacity>
);

const CreateLayout = () => {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  }
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="attraction"
        component={CreateAttraction}
        options={{
          headerShown: true,
          headerTitle: 'Create Attraction',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D', height: 95 },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />
      <Stack.Screen
        name="dining"
        component={CreateDining}
        options={{
          headerShown: true,
          headerTitle: 'Create Dining',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D', height: 95 },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />
      <Stack.Screen
        name="event"
        component={CreateEvent}
        options={{
          headerShown: true,
          headerTitle: 'Create Event',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D', height: 95 },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
        />
    </Stack.Navigator>
  )
}

export default CreateLayout