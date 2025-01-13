import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";

import { icons } from "../constants";

const FormField = ({
  title,
  placeholder,
  value,
  handleChangeText,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="space-y-2 w-11/12 mb-7">
      <Text className="font-ksemibold text-lg">{title}</Text>
      <View className="bg-white rounded-md h-14 justify-start items-center flex-row border-2 border-secondary focus:border-black">
        <TextInput
          className="flex-1 font-pregular text-base ml-3"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7E6C6C"
          onChangeText={handleChangeText}
          // Apply secureTextEntry to both "Password" and "Re-enter Password"
          secureTextEntry={(title === "Password" || title === "Re-enter Password") && !showPassword}
          {...props}
        />

        {/* Show/Hide Password Toggle */}
        {(title === "Password" || title === "Re-enter Password") && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={showPassword ? icons.eye : icons.eyeHide}
              className="w-6 h-6 mr-3"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
