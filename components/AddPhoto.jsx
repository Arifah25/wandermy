import { TouchableOpacity, Text, View } from 'react-native'
import React from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';

const AddPhoto = ({
  handlePress,
  isLoading,
}) => {
  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-secondary mt-1 w-full rounded-md h-14 justify-center items-center ${isLoading ? "opacity-50" : ""}`}
        disabled={isLoading}
      > 
        <View className="w-full items-center justify-center flex-row gap-5">
          <AntDesign name="upload" size={24} color="black" />
          <Text className={`text-black font-kregular text-lg`}>
            Add Photo(s)
          </Text>
        </View>
    </TouchableOpacity>
  )
}

export default AddPhoto