import { useState } from "react";
import { View, Text, TextInput } from "react-native";

const CreateForm = ({
  title,
  placeholder,
  value,
  handleChangeText,
  tags,
  error,
  ...props
}) => {
  return (
    <View className="space-y-1 w-full mb-1 mt-4">
      <Text className="font-kregular text-xl mb-1">{title}</Text>
      <View
        className={`${tags ? 'h-40 items-start' : 'h-12 items-center'} bg-white rounded-md justify-start flex-row`}
        style={{
          borderWidth: 2,
          borderColor: error ? 'red' : '#ccc', // Red border for errors
          borderRadius: 8,
        }}
      >
        <TextInput
          className="w-full font-pregular text-base py-2 px-2"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7E6C6C"
          onChangeText={handleChangeText}
          multiline
          {...props}
        />
      </View>
      {error && <Text style={{ color: 'red', fontSize: 12 }}>{error}</Text>}
    </View>
  );
};

export default CreateForm;
