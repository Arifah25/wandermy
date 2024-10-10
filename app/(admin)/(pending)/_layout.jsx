import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import {icons} from '../../../constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';


const Stack = createNativeStackNavigator();

const HeaderIcon = ({ onPress, icon }) => (
  <TouchableOpacity onPress={onPress} style={{ margin: 10 }}>
    <Image source={icon} style={{ width: 24, height: 24, tintColor: '#fff' }} />
  </TouchableOpacity>
);

const PendingLayout = () => {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  }
  
  return (
    <Stack.Navigator>
      
    </Stack.Navigator>
  )
}

export default PendingLayout