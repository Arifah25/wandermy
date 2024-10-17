import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import EditAttraction from '../(edit)/editattraction';
import EditDining from '../(edit)/editdining';
import EditEvent from '../(edit)/editevent';
import { icons } from '../../../../constants';

const Stack = createNativeStackNavigator();

const HeaderIcon = ({ onPress, icon }) => (
  <TouchableOpacity onPress={onPress} style={{ margin: 10 }}>
    <Image source={icon} style={{ width: 24, height: 24, tintColor: '#fff' }} />
  </TouchableOpacity>
);

const EditLayout = () => {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  }
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="editattraction"
        component={EditAttraction}
        options={{
          headerShown: true,
          headerTitle: 'Edit Attraction',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D', height: 95 },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />
      <Stack.Screen
        name="editdining"
        component={EditDining}
        options={{
          headerShown: true,
          headerTitle: 'Edit Dining',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D', height: 95 },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />
      <Stack.Screen
        name="editevent"
        component={EditEvent}
        options={{
          headerShown: true,
          headerTitle: 'Edit Event',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D', height: 95 },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
        />
    </Stack.Navigator>
  )
}

export default EditLayout