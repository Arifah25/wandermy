import { View, Text, TouchableOpacity } from 'react-native'
import React, { useContext, useState } from 'react'
import { useRouter } from 'expo-router'
import { CreateItineraryContext } from '../../../../context/CreateItineraryContext';
import CalendarPicker from "react-native-calendar-picker"
import moment from 'moment';

const SelectDate = () => {
    const router = useRouter();
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const {itineraryData, setItineraryData} = useContext(CreateItineraryContext);

    const onDateChange = (date, type) => {
        if (type == 'START_DATE')
        {
          setStartDate(moment(date));
        }
        else if (type == 'END_DATE')
        {
          setEndDate(moment(date));
        }
      }

      const OnDateSelectionContinue = () => {
        const totalNoOfDays = endDate.diff(startDate, 'days');
        console.log(totalNoOfDays+1);
        setItineraryData({
          ...itineraryData,
          startDate: startDate,
          endDate: endDate,
          totalNoOfDays: totalNoOfDays+1
        });
        router.push('(tabs)/(itinerary)/(create-itinerary)/budget')
      }

  return (
    <View className="bg-white h-full">
      <View className="justify-center items-center my-5">
        <Text
        className="text-center font-ksemibold text-3xl"
        >Travel Dates</Text>
      </View>
      <View className="">
        <CalendarPicker 
        onDateChange={onDateChange}
        allowRangeSelection={true}
        minDate={new Date()}
        maxRangeDuration={5}
        selectedRangeStyle={{
          backgroundColor: 'salmon'
        }}
        selectedDayTextStyle={{
          color: 'white'
        }}
         />
      </View>
      <View className="mt-5 justify-center items-center">
        <TouchableOpacity 
        onPress={OnDateSelectionContinue}
        className="bg-primary w-3/4 py-3 rounded-md items-center"
        >
          <Text
          className="text-white text-lg font-kregular"
          >Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default SelectDate