import { View, Text } from 'react-native'
import React from 'react'

const OptionCard = ({
    option,
}) => {
  return (
    <View 
    className="w-full bg-secondary mb-5"
    >
      <Text className="font-kbold text-xl">{option?.title}</Text> 
      <Text>{option?.desc}</Text>
      <Text>{option?.icon}</Text>
    </View>
  )
}

export default OptionCard