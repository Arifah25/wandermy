import React, { useState } from "react";
import { View, Platform, Button } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const TimeField = ({
  value,
  placeholder = "Time",
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
    <View
    className=" w-24 rounded-lg">
      <Button
       title={value || placeholder} 
       onPress={() => setShow(true)} 
       color={"#808080"}
       />
       {show && (
        <DateTimePicker
          value={dateValue}
          mode="time"
          display="default"
          onChange={onChange}
          {...props}
        />
      )}
      
    </View>
  );
};

export default TimeField;
