import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Home = () => {
  return (
    <SafeAreaView
    className="h-full flex-1 p-5 items-center justify-center"
    >
      <Text>Home</Text>
    </SafeAreaView>
  )
}

export default Home