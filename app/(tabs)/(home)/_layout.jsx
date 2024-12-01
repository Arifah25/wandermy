import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { icons } from '../../../constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import Home from './index';
import Notification from './notification';

const Stack = createNativeStackNavigator();

const HeaderIcon = ({ onPress, icon }) => (
  <TouchableOpacity onPress={onPress} style={{ margin: 10 }}>
    <Image source={icon} style={{ width: 24, height: 24, tintColor: '#fff' }} />
  </TouchableOpacity>
);

const HomeLayout = () => {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  }
  
  const handleBellPress = () => {
    // Navigate to the notification screen
    router.push('(tabs)/(home)/notification');
    console.log('dah');
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="index"
        component={Home}
        options={{ 
          headerTitle: 'WanderMy',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
          headerRight: () => <HeaderIcon onPress={handleBellPress} icon={icons.bell} />,
        }}
      />
      <Stack.Screen
        name="notification"
        component={Notification}
        options={{ 
          headerTitle: 'Notication',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
        }}
      />
    </Stack.Navigator>
  )
}

export default HomeLayout