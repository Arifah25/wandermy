import { View, Text, Image } from 'react-native'
import React from 'react'
import { icons } from '../../constants';
import { Tabs, usePathname } from 'expo-router'

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={icon}
        resizeMode="contain"
        style={{ tintColor: color, width: 24, height: 24, }}
      />
      {/* if want to put label */}
      {/* <Text style={{ color, fontSize: 12, fontWeight: focused ? 'bold' : 'normal' }}>{name}</Text> */}
    </View>
  );
};

const TabsLayout = () => {
  const pathname = usePathname();

  // Log the current route name
  //  console.log('Current route:', pathname);

   return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#A91D1D',
        tabBarInactiveTintColor: '#000',
        tabBarStyle: pathname === '/' ? {
          backgroundColor: '#CBCBCB',
          borderTopWidth: 1,
          borderTopColor: '#C3C3C3',
          height: `${9}%`,
          justifyContent: 'center',
          alignItems: 'center',
        } : {
          display: 'none', // Hide the tab bar on all screens except /index
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        // component={HomeLayout}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
            icon={icons.home} 
            color={color} 
            name="Home" 
            focused={focused}
             />
          ),
        }}
      />
      <Tabs.Screen
        name="(pending)"
        // component={PendingLayout}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
            icon={icons.eye} 
            color={color} 
            name="Pending" 
            focused={focused}
             />
          ),          
        }}
      />
      
    </Tabs>
  )
}

export default TabsLayout
