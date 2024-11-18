import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import {icons} from '../../../constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import CreateLayout from './(create)/_layout';
import EditLayout from './(edit)/_layout';
import HomeAdmin from './index';
import DetailsH from './details';
import HomeDetails from './homedetails';

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

  const logoutAdmin = () => {
    router.replace('(auth)/sign-in')// Navigate to Login page (logout)}/>,
  }


  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="index"
        component={HomeAdmin}
        options={{ 
          // headerShown: false,
          headerTitle: 'Admin',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
          headerRight: () => <HeaderIcon icon={icons.bell}/>,
          headerLeft: () => <HeaderIcon icon={icons.logout} onPress={logoutAdmin}/> 
        }}
      />
      <Stack.Screen 
        name="details"
        component={DetailsH}
        options={{
          // headerShown: false,
          headerTitle: 'Listings',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />
      <Stack.Screen 
        name="homedetails"
        component={HomeDetails}
        options={{
          // headerShown: false,
          headerTitle: 'Listings',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />

      <Stack.Screen
        name="(create)"
        component={CreateLayout}
        options={{ 
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="(edit)"
        component={EditLayout}
        options={{ 
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}

export default HomeLayout