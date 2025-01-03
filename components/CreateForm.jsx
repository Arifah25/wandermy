import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";

import { icons } from "../constants";

const CreateForm = ({
  title,
  placeholder,
  value,
  handleChangeText,
  tags,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View 
    className="space-y-1 w-full mb-5"
    >
      <Text 
      className="font-kregular text-xl mb-1"
      >
      {title}
      </Text>
      <View 
      className={`${tags ? 'h-40 items-start' : 'h-12 items-center'} bg-white rounded-md justify-start flex-row border-2 border-secondary focus:border-black `}
      >
        <TextInput
        className={`w-full font-pregular text-base py-2 px-2 `}
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#7E6C6C"
        onChangeText={handleChangeText}
        multiline
        // textAlignVertical="top" // Align text to the top of the TextInput
        {...props}
        />
      </View>
    </View>
  )
}

export default CreateForm