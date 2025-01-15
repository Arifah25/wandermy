import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { icons } from '../../../constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import Home from '.';
import Notification from './notification';
import Details from './details';
import AddReview from './addreview';
import Points from './points';

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
    <Stack.Navigator >
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
        name="details"
        component={Details}
        options={{ 
          headerTitle: 'WanderMy',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />
      <Stack.Screen
        name="notification"
        component={Notification}
        options={{ 
          headerTitle: 'Notification',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />
      <Stack.Screen 
        name="addreview"
        component={AddReview}
        options={{
          headerTitle: 'Add Review',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />
      <Stack.Screen 
        name="points"
        component={Points}
        options={{
          headerTitle: 'Badge Seeker',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />
    </Stack.Navigator>
  )
}

export default HomeLayout