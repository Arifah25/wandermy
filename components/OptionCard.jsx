import { View, Text } from 'react-native'
import React from 'react'

const OptionCard = ({
    option,
    selected,
}) => {
  return (
    <View 
    className="w-11/12 bg-[#FFCFB3]  mb-7 p-4 rounded-lg flex-row items-center"
    style={[selected?.id==option?.id&&{backgroundColor:'#E78F81'}]}
    >
      <View className="w-4/5 py-1">
        <Text className="font-kbold text-xl">{option?.title}</Text> 
        <Text className="font-pregular">{option?.desc}</Text>
      </View>
      <Text className="text-4xl">{option?.icon}</Text>
    </View>
  )
}

export default OptionCard