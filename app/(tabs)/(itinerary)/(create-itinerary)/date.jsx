import { View, Text } from 'react-native'
import React from 'react'
import CalendarPicker from 'react-native-calendar-picker'

const SelectDate = () => {
  return (
    <View>
      <View>
        <Text>SelectDate</Text>
      </View>
      <View>
        <CalendarPicker 
        onDateChange={this.onDateChange}
        allowRangeSelection={true}
        minDate={new Date()}
         />
      </View>
    </View>
  )
}

export default SelectDate