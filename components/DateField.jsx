import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const DateField = ({ value, placeholder, handleChangeText, ...props }) => {
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    if (event.type === 'dismissed' || !selectedDate) {
      setShow(false); // Close picker on cancel
      return;
    }

    setShow(false); // Ensure the picker closes
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1; // months are 0-based
    const day = selectedDate.getDate();
    const formattedDate = `${day < 10 ? `0${day}` : day}/${month < 10 ? `0${month}` : month}/${year}`;
    handleChangeText(formattedDate); // Pass formatted date back
  };

  // Parse `value` into a `Date` object
  const parsedValue = value && typeof value === 'string' && value.includes('/')
    ? value
    : placeholder || '01/01/2025';

  const [day, month, year] = parsedValue.split('/').map(Number);
  const dateValue = new Date(year || 2025, (month || 1) - 1, day || 1);

  return (
    <View>
      {Platform.OS === 'ios' ? (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="default"
          onChange={onChange}
          {...props}
        />
      ) : show ? (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="calendar"
          onChange={onChange}
          {...props}
        />
      ) : (
        <TouchableOpacity
          onPress={() => setShow(true)}
          style={{
            width: 100,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
          }}
        >
          <Text>{value || placeholder}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DateField;
