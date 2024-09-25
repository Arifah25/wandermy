import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const TimeField = ({
  value,
  placeholder = "Select Time",
  handleChangeText,
  ...props
}) => {
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const formattedTime = `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
      handleChangeText(formattedTime);
      setShow(false);
    }
  };

  // Validate value to ensure it's in the correct format
  const parsedValue = typeof value === 'string' && value.includes(':') ? value : '00:00';
  const [hours, minutes] = parsedValue.split(':').map(Number);

  const dateValue = new Date();
  dateValue.setHours(hours);
  dateValue.setMinutes(minutes);

  return (
    <View>
      {Platform.OS === 'ios' ? (
        <View className=" w-24 rounded-md justify-center items-center">
          <DateTimePicker
            value={dateValue}
            mode="time"
            display="spinner"
            onChange={onChange}
            {...props}
          />
        </View>
      ) : (
        show ? (
          <View className=" w-24 rounded-md justify-center items-center">
            <DateTimePicker
              value={dateValue}
              mode="time"
              display="spinner"
              onChange={onChange}
              {...props}
            />
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShow(true)}
            className="w-24 rounded-md h-10 justify-center items-center bg-secondary"
          >
            <Text className="text-base">
              {value || placeholder}
            </Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

export default TimeField;