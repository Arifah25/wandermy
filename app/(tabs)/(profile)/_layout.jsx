import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Image, TouchableOpacity } from 'react-native';
import { icons } from '../../../constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Profile from './index';

const Stack = createNativeStackNavigator();

const HeaderIcon = ({ onPress, icon }) => (
  <TouchableOpacity onPress={onPress} style={{ marginRight: 10 }}>
    <Image source={icon} style={{ width: 24, height: 24, tintColor: '#fff', margin: 20 }} />
  </TouchableOpacity>
);

const ProfileLayout = () => {
  return (
    <Stack.Navigator>
    <Stack.Screen
      name="Profile"
      component={Profile}
      options={{ 
        headerTitle: 'Profile',
        headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
        headerStyle: { backgroundColor: '#A91D1D', height: 95 },
        headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
      }}
    />
  </Stack.Navigator>
  )
}

export default ProfileLayout