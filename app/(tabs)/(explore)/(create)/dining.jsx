import React, { useState } from 'react';
import { View, Button, Platform, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateDining = () => {
  const [date, setDate] = useState(new Date()); // Initialize with current date
  const [show, setShow] = useState(false); // Control the visibility of the picker
  const [mode, setMode] = useState('date'); // Switch between date and time

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios'); // Close picker after selecting on Android, stay open on iOS
    setDate(currentDate); // Set the selected date or time
  };

  // Function to show the DatePicker or TimePicker
  const showMode = (currentMode) => {
    setShow(true); // Show the picker
    setMode(currentMode); // Set the mode to 'date' or 'time'
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* Show the selected date/time */}
      <Text>Selected Date: {date.toLocaleDateString()}</Text>
      <Text>Selected Time: {date.toLocaleTimeString()}</Text>

      {/* Button to show DatePicker */}
      <Button onPress={() => showMode('date')} title="Show Date Picker" />
      
      {/* Button to show TimePicker */}
      <Button onPress={() => showMode('time')} title="Show Time Picker" />

      {/* Render the DateTimePicker component when `show` is true */}
      {show && (
        <DateTimePicker
          value={date} // Set the initial date or time
          mode={mode} // Use 'date' or 'time' mode
          display="default" // Display type: 'default', 'spinner', or 'calendar'
          onChange={onChange} // Handle the date or time change
        />
      )}
    </View>
  );
};

export default CreateDining;
