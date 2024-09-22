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
      className="font-kregular text-xl"
      >
      {title}
      </Text>
      <View 
      className={` ${tags ? 'h-40' : 'h-12'} bg-white rounded-md justify-start items-center flex-row border-2 border-secondary focus:border-black`}
      >
        <TextInput
        className="flex-1 font-pregular text-base ml-3"
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#7E6C6C"
        onChangeText={handleChangeText}
        {...props}
        />
      </View>
    </View>
  )
}

export default CreateForm