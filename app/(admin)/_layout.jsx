import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import {icons} from '../../constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import HomeLayout from './(home)/_layout';
import PendingLayout from './(pending)/_layout';


const Stack = createNativeStackNavigator();

const HeaderIcon = ({ onPress, icon }) => (
  <TouchableOpacity onPress={onPress} style={{ margin: 10 }}>
    <Image source={icon} style={{ width: 24, height: 24, tintColor: '#fff' }} />
  </TouchableOpacity>
);

const AdminLayout = () => {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  }
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="(home)"
        component={HomeLayout}
        options={{ 
          headerShown: false,
          // headerTitle: 'Admin',
          // headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          // headerTitleAlign: 'center',
          // headerStyle: { backgroundColor: '#A91D1D' },
          // headerRight: () => <HeaderIcon icon={icons.bell} />,
        }}
      />
      <Stack.Screen 
        name="(pending)"
        component={PendingLayout}
        options={{
          headerShown: false,
          headerTitle: 'Listings',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />
    </Stack.Navigator>
  )
}

export default AdminLayout