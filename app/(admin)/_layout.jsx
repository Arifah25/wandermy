import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import {icons} from '../../constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import HomeLayout from './(home)/_layout';
import PendingLayout from './(pending)/_layout';


const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const HeaderIcon = ({ onPress, icon }) => (
  <TouchableOpacity onPress={onPress} style={{ margin: 10 }}>
    <Image source={icon} style={{ width: 24, height: 24, tintColor: '#fff' }} />
  </TouchableOpacity>
);

// const AdminLayout = () => {
//   const router = useRouter();
//   const handleBack = () => {
//     router.back();
//   }
  
//   return (
//     <Stack.Navigator>
//       <Stack.Screen
//         name="(home)"
//         component={HomeLayout}
//         options={{ 
//           headerShown: false,
//           // headerTitle: 'Admin',
//           // headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
//           // headerTitleAlign: 'center',
//           // headerStyle: { backgroundColor: '#A91D1D' },
//           // headerRight: () => <HeaderIcon icon={icons.bell} />,
//         }}
//       />
//       <Stack.Screen 
//         name="(pending)"
//         component={PendingLayout}
//         options={{
//           headerShown: false,
//           headerTitle: 'Listings',
//           headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
//           headerTitleAlign: 'center',
//           headerStyle: { backgroundColor: '#A91D1D' },
//           headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
//         }}
//       />
//     </Stack.Navigator>
//   )
// }

const HomeTabs = () => {
  return (
    <Tabs.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#A91D1D',
        tabBarInactiveTintColor: '#000',
        tabBarStyle: {
          backgroundColor: '#CBCBCB',
          borderTopWidth: 1,
          borderTopColor: '#C3C3C3',
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="Pending"
        component={PendingLayout}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={icons.eye}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#A91D1D' : '#000',
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Home"
        component={HomeLayout}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={icons.home}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#A91D1D' : '#000',
              }}
            />
          ),
        }}
      />
    </Tabs.Navigator>
  );
};

const AdminLayout = () => {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };
  
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeTabs"
        component={HomeTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PendingDetails"
        component={PendingLayout}
        options={{
          headerShown: true,
          headerTitle: 'Listings',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />
    </Stack.Navigator>
  );
};

export default AdminLayout