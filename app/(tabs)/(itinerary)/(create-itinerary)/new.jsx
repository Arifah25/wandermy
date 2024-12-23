import { View, Text, TextInput } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, DateField, SearchPlace } from '../../../../components';
import 'react-native-get-random-values';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { CreateItineraryContext } from '../../../../context/CreateItineraryContext';
import CalendarPicker from 'react-native-calendar-picker';
import RNPickerSelect from 'react-native-picker-select';
import moment from 'moment';
import { SelectBudgetList, SelectTravelList } from '../../../../constants/option';

const NewItinerary = () => {
  const router = useRouter();
  const { itineraryData, setItineraryData } = useContext(CreateItineraryContext);

  // Initialize state variables for attributes in event
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [selectedBudget, setSelectedBudget] = useState();
  const [selectedTraveler, setSelectedTraveler] = useState();

  const onDateChange = (date, type) => {
    if (type == 'START_DATE') {
      setStartDate(moment(date));
    } else if (type == 'END_DATE') {
      setEndDate(moment(date));
    }
  };

  const OnDateSelectionContinue = () => {
    const totalNoOfDays = endDate.diff(startDate, 'days');
    setItineraryData({
      ...itineraryData,
      startDate: startDate,
      endDate: endDate,
      totalNoOfDays: totalNoOfDays + 1,
    });
    router.push('(tabs)/(itinerary)/(create-itinerary)/traveler');
  };

  const handleTripNameChange = (value) => {
    setTripName(value);
    setItineraryData((prevData) => ({
      ...prevData,
      tripName: value,
    }));
  };

  useEffect(() => {
    if (selectedBudget) {
      setItineraryData((prevData) => ({
        ...prevData,
        budget: selectedBudget,
      }));
    }
  }, [selectedBudget]);

  useEffect(() => {
    if (selectedTraveler) {
      setItineraryData((prevData) => ({
        ...prevData,
        traveler: selectedTraveler,
      }));
    }
  }, [selectedTraveler]);

  return (
    <View className="bg-white flex-1 p-5 h-full items-center justify-start">
      <ScrollView></ScrollView>
      <View className="w-full items-center">
        <Text className="font-kregular text-xl">Select A Destination</Text>
        <View className="w-full h-14 items-center mt-2 z-50">
          <SearchPlace />
        </View>
      </View>
      <View className="w-full items-center mt-5">
        <Text className="font-kregular text-xl">Trip Name</Text>
        <View className="w-11/12 border-2 border-secondary rounded-md mt-2 h-14 p-3 justify-center focus:border-black">
          <TextInput
            className="font-kregular text-base h-14"
            placeholder="e.g, Semester Break Trip"
            placeholderTextColor="#7E6C6C"
            value={tripName}
            onChangeText={handleTripNameChange}
          />
        </View>
      </View>
      <View className="w-full items-center mt-5">
        <Text className="font-kregular text-xl">Budget</Text>
        <View className="w-11/12 border-2 border-secondary rounded-md mt-2 h-14 p-3 justify-center focus:border-black">
          <RNPickerSelect
            onValueChange={(value) => setSelectedBudget(value)}
            items={SelectBudgetList.map((item) => ({
              label: `${item.title} - ${item.desc}`,
              value: item.title,
            }))}
            placeholder={{ label: 'Select your budget', value: null }}
            style={{
              inputIOS: {
                fontFamily: 'Kanit',
                fontSize: 16,
                paddingVertical: 12,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 4,
                color: 'black',
                paddingRight: 30, // to ensure the text is never behind the icon
              },
              inputAndroid: {
                
                fontSize: 16,
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderWidth: 0.5,
                borderColor: 'purple',
                borderRadius: 8,
                color: 'black',
                paddingRight: 30, // to ensure the text is never behind the icon
              },
            }}
          />
        </View>
      </View>
      <View className="w-full items-center mt-5">
        <Text className="font-kregular text-xl">Traveler</Text>
        <View className="w-11/12 border-2 border-secondary rounded-md mt-2 h-14 p-3 justify-center focus:border-black">
          <RNPickerSelect
            onValueChange={(value) => setSelectedTraveler(value)}
            items={SelectTravelList.map((item) => ({
              label: `${item.title} - ${item.desc}`,
              value: item.title,
            }))}
            placeholder={{ label: 'Select your traveler', value: null }}
            style={{
              inputIOS: {
                fontSize: 16,
                paddingVertical: 12,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 4,
                color: 'black',
                paddingRight: 30, // to ensure the text is never behind the icon
              },
              inputAndroid: {
                fontSize: 16,
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderWidth: 0.5,
                borderColor: 'purple',
                borderRadius: 8,
                color: 'black',
                paddingRight: 30, // to ensure the text is never behind the icon
              },
            }}
          />
        </View>
      </View>
      <View className="justify-center items-center mt-7">
        <Text className="font-kregular text-xl">Travel Dates</Text>
      </View>
      <View className="mt-2">
        <CalendarPicker
          onDateChange={onDateChange}
          width={345}
          height={345}
          allowRangeSelection={true}
          minDate={new Date()}
          minRangeDuration={1}
          maxRangeDuration={5}
          selectedRangeStyle={{
            backgroundColor: 'salmon',
          }}
          selectedDayTextStyle={{
            color: 'white',
          }}
        />
      </View>
      <Button
        title="Start Crafting"
        textColor="text-white"
        style="bg-primary my-10 w-3/5"
        handlePress={OnDateSelectionContinue}
      />
    </View>
  );
};

export default NewItinerary;