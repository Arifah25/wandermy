import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const DateField = ({
  value,
  placeholder,
  handleChangeText,
  ...props
}) => {
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1; // months are 0-based
      const day = selectedDate.getDate();
      const formattedDate = `${month < 10 ? `0${month}` : month}/${day < 10 ? `0${day}` : day}/${year}`;
      handleChangeText(formattedDate);
      setShow(false);
    }
  };

  // Validate value to ensure it's in the correct format
  const parsedValue = typeof value === 'string' && value.includes('/') ? value : '01/01/2022';
  const [month, day, year] = parsedValue.split('/').map(Number);

  const dateValue = new Date();
  dateValue.setFullYear(year);
  dateValue.setMonth(month - 1); // months are 0-based
  dateValue.setDate(day);

  return (
    <View>
      {Platform.OS === 'ios' ? (
        <View className="flex-1 items-center justify-center">
          <DateTimePicker
            value={ dateValue || placeholder}
            mode="date"
            display="calendar"
            // onChange={onChange}
            {...props}
          />
        </View>
      ) : (
        show ? (
          <View className="">
            <DateTimePicker
              value={dateValue}
              mode="date"
              display="calendar"
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
              {value}
            </Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

export default DateField;