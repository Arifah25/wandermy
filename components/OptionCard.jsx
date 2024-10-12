import { View, Text } from 'react-native'
import React from 'react'

const OptionCard = ({
    option,
    selected,
}) => {
  return (
    <View 
    className="w-11/12 bg-secondary mb-5 p-4 rounded-lg flex-row items-center"
    style={[selected?.id==option?.id&&{borderWidth:2, borderColor: '#000'}]}
    >
      <View className="w-4/5">
        <Text className="font-kbold text-xl">{option?.title}</Text> 
        <Text className="font-pregular">{option?.desc}</Text>
      </View>
      <Text className="text-4xl">{option?.icon}</Text>
    </View>
  )
}

export default OptionCard