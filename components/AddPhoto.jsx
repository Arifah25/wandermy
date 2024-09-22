import { TouchableOpacity, Text } from 'react-native'
import React from 'react'

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
        <Text className={`text-black font-kregular text-lg`}>
          Add Photo(s)
        </Text>
    </TouchableOpacity>
  )
}

export default AddPhoto