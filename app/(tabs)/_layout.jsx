import { View, Text, Image } from 'react-native'
import React from 'react'
import { icons } from '../../constants';
import { Tabs } from 'expo-router'

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <Image
        source={icon}
        resizeMode="contain"
        style={{ tintColor: color, width: 24, height: 24 }}
      />
      <Text style={{ color, fontSize: 12, fontWeight: focused ? 'bold' : 'normal' }}>{name}</Text>
    </View>
  );
};

const TabsLayout = () => {
  return (
    <Tabs
    screenOptions={{
      tabBarShowLabel: false,
      tabBarActiveTintColor: '#A91D1D',
      tabBarInactiveTintColor: '#000',
      tabBarStyle: {
        backgroundColor: '#CBCBCB',
        borderTopWidth: 1,
        borderTopColor: '#C3C3C3',
        height: 80,
      },
    }}
    >
      <Tabs.Screen
        name="(home)"
        //component={HomeLayout}
        options={{
          //headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.home} color={color} name="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(explore)"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.explore} color={color} name="Explore" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(itinerary)"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.itinerary} color={color} name="Itinerary" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={icons.profile} color={color} name="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  )
}

export default TabsLayout