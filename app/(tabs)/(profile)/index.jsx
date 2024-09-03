import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Profile = () => {
  return (
    <SafeAreaView
    className="h-full flex-1 p-5 items-center justify-center"
    >
      <Text>Profile</Text>
    </SafeAreaView>
  )
}

export default Profile