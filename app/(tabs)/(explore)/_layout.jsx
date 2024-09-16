import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { icons } from '../../../constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Explore from './index';
import { useRouter } from 'expo-router';
import CreateLayout from './(create)/_layout';
import CreateAttraction from './(create)/attraction';
import CreateDining from './(create)/dining';
import CreateEvent from './(create)/event';

const Stack = createNativeStackNavigator();

const HeaderIcon = ({ onPress, icon }) => (
  <TouchableOpacity onPress={onPress} style={{ margin: 10 }}>
    <Image source={icon} style={{ width: 24, height: 24, tintColor: '#fff' }} />
  </TouchableOpacity>
);

const ExploreLayout = () => {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  }
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Explore"
        component={Explore}
        options={{ 
          headerTitle: 'Explore',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
        }}
      />
      <Stack.Screen
        name="(create)"
        component={CreateLayout}
        options={{ 
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}

export default ExploreLayout