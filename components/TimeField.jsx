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
    setShow(Platform.OS === "ios");
    if (selectedDate) {
      let hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      let period = "AM";

      // Convert to 12-hour format
      if (hours >= 12) {
        period = "PM";
        hours = hours > 12 ? hours - 12 : hours; // Convert hours to 12-hour format
      } else if (hours === 0) {
        hours = 12; // Midnight case
      }

      const formattedTime = `${hours}:${minutes < 10 ? `0${minutes}` : minutes} ${period}`;
      handleChangeText(formattedTime);
      setShow(false);
    }
  };

  // Validate value to ensure it's in the correct format
  const parsedValue = typeof value === "string" && value.match(/\d{1,2}:\d{2} (AM|PM)/) ? value : "12:00 AM";
  const [timePart, period] = parsedValue.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  // Convert back to 24-hour format for the DateTimePicker
  if (period === "PM" && hours < 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  const dateValue = new Date();
  dateValue.setHours(hours);
  dateValue.setMinutes(minutes);

  return (
    <View>
      {Platform.OS === "ios" ? (
        <View className=" w-full rounded-md justify-center items-center">
          <DateTimePicker
            value={dateValue}
            mode="time"
            display="default"
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
              is24Hour={false} // Disable 24-hour mode
            />
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShow(true)}
            className="w-24 rounded-md h-10 justify-center items-center bg-secondary"
          >
            <Text className="text-base">{value || placeholder}</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

export default TimeField;
