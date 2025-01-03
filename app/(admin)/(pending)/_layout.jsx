import React from 'react';
import { Image, TouchableOpacity, Alert } from 'react-native';
import {icons} from '../../../constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import PendingAdmin from './index';
import PendingDetails from './pendingdetails';


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


  // const logoutAdmin = () => {
  //   router.replace('(auth)/sign-in')// Navigate to Login page (logout)}/>,
  //   console.log('Sign Out Admin Successful');
  // }
  const logoutAdmin = () => {
    Alert.alert(
      'Logout Confirmation',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Logout Cancelled'),
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            router.replace('(auth)/sign-in'); // Navigate to Login page
            console.log('Sign Out Admin Successful');
          },
        },
      ],
      { cancelable: true }
    );
  };
 
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="index"
        component={PendingAdmin}
        options={{
          // headerShown: false,
          headerTitle: 'Pending',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
          headerLeft: () => <HeaderIcon icon={icons.logout} onPress={logoutAdmin}/>
        }}
      />
      <Stack.Screen
        name="pendingdetails"
        component={PendingDetails}
        options={{
          // headerShown: false,
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


export default PendingLayout
