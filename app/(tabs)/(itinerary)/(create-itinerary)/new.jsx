import { View, Text, TextInput, ScrollView, Alert, Platform } from 'react-native';
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
    if (type === 'START_DATE') {
      setStartDate(moment(date));
    } else if (type === 'END_DATE') {
      setEndDate(moment(date));
    }
  };

  const OnDateSelectionContinue = () => {
    if (!tripName || !startDate || !endDate || !selectedBudget || !selectedTraveler) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const totalNoOfDays = endDate.diff(startDate, 'days');
    setItineraryData({
      ...itineraryData,
      startDate: startDate,
      endDate: endDate,
      totalNoOfDays: totalNoOfDays + 1,
    });
    router.push('(tabs)/(itinerary)/(create-itinerary)/reviewdetails');
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
    <View className="bg-white flex-1 h-full items-center justify-start">
      <ScrollView className="w-full h-full p-5">
        <View className="w-full items-center">
          <Text className="font-kregular text-xl">Select A Destination</Text>
          <View className="w-full h-14 items-center mt-2 z-50 text-secondary">
            <SearchPlace />
          </View>
        </View>
        <View className="w-full items-center mt-5">
          <Text className="font-kregular text-xl">Trip Name</Text>
          <View className="w-11/12 border-2 border-secondary rounded-md mt-2 h-14 p-3 justify-center focus:border-black">
            <TextInput
              className="font-kregular text-base h-14"
              placeholder="e.g, Semester Break Trip"
              placeholderTextColor="#d9d9d9"
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
                label: `${item.icon} \t ${item.title}`,
                value: item.title,
              }))}
              placeholder={{ label: 'Select your budget', value: "null" }}
              style={{
                inputIOS: {
                  fontSize: 16,
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 4,
                  color: 'black',
                  backgroundColor: 'white',
                  paddingRight: 30, // to ensure the text is never behind the icon
                },
                inputAndroid: {
                  fontSize: 16,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  color: 'black',
                  paddingRight: 30, // to ensure the text is never behind the icon
                },
                iconContainer: {
                  top: 10,
                  right: 12,
                },
              }}
              {...(Platform.OS === 'ios' && {
                pickerProps: {
                  style: {
                    backgroundColor: '#fff',
                  },
                  itemStyle: {
                    color: 'black',
                  },
                },
              })}
              useNativeAndroidPickerStyle={false}
              Icon={() => {
                return (
                  <View
                    style={{
                      backgroundColor: 'transparent',
                      borderTopWidth: 10,
                      borderTopColor: 'black',
                      borderRightWidth: 10,
                      borderRightColor: 'transparent',
                      borderLeftWidth: 10,
                      borderLeftColor: 'transparent',
                      width: 0,
                      height: 0,
                    }}
                  />
                );
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
                label: `${item.icon} \t ${item.title}`,
                value: item.title,
              }))}
              placeholder={{ label: 'Select your traveler', value: "null" }}
              style={{
                inputIOS: {
                  fontSize: 16,
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 4,
                  color: 'black',
                  paddingRight: 30, // to ensure the text is never behind the icon
                },
                inputAndroid: {
                  fontSize: 16,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  color: 'black',
                  paddingRight: 30, // to ensure the text is never behind the icon
                },
                iconContainer: {
                  top: 10,
                  right: 12,
                },
              }}
              {...(Platform.OS === 'ios' && {
                pickerProps: {
                  style: {
                    backgroundColor: '#fff',
                  },
                  itemStyle: {
                    color: 'black',
                  },
                },
              })}
              useNativeAndroidPickerStyle={false}
              Icon={() => {
                return (
                  <View
                    style={{
                      backgroundColor: 'transparent',
                      borderTopWidth: 10,
                      borderTopColor: 'black',
                      borderRightWidth: 10,
                      borderRightColor: 'transparent',
                      borderLeftWidth: 10,
                      borderLeftColor: 'transparent',
                      width: 0,
                      height: 0,
                    }}
                  />
                );
              }}
            />
          </View>
        </View>
        <View className="justify-center items-center mt-7">
          <Text className="font-kregular text-xl">Travel Dates</Text>
          <View className="mt-2 border-secondary border-2 rounded-md p-3 w-11/12">
            <CalendarPicker
              onDateChange={onDateChange}
              width={315}
              height={315}
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
        </View>
        <View className="w-full items-center">
          <Button
            title="Start Crafting"
            textColor="text-white"
            style="bg-primary mt-7 mb-20 w-3/5"
            handlePress={OnDateSelectionContinue}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default NewItinerary;