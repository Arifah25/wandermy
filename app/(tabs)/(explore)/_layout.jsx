import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { icons } from '../../../constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Explore from '.';
import { useRouter } from 'expo-router';
import CreateLayout from './(create)/_layout';
import Details from './details';
import AddReview from './addreview';

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
        name="index"
        component={Explore}
        options={{ 
          headerTitle: 'Explore',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
        }}
      />
      <Stack.Screen 
        name="details"
        component={Details}
        options={{
          headerTitle: 'Explore',
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