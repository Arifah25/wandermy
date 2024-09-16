import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const MyItineraries = () => {
  return (
    <SafeAreaView
    className="bg-white h-full flex-1 p-5 items-center justify-start"
    >
      <Text>My Itineraries</Text>
    </SafeAreaView>
  )
}

export default MyItineraries