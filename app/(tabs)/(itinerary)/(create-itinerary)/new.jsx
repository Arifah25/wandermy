import { View, Text, TextInput, Alert, Platform, FlatList } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, DateField, SearchPlace } from '../../../../components';
import 'react-native-get-random-values';
import { CreateItineraryContext } from '../../../../context/CreateItineraryContext';
import CalendarPicker from 'react-native-calendar-picker';
import { Picker } from '@react-native-picker/picker';
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

  const renderContent = () => (
    <View className="bg-white">
    <View className="mx-5 flex-1 h-full items-center justify-start ">
      
      <View className="w-full items-center ">
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
          <Picker
            selectedValue={selectedBudget}
            onValueChange={(value) => setSelectedBudget(value)}
            style={{ height: 60, width: '100%' }}
          >
            <Picker.Item label="Select your budget" value="null" />
            {SelectBudgetList.map((item) => (
              <Picker.Item key={item.title} label={`${item.icon} \t ${item.title}`} value={item.title} />
            ))}
          </Picker>
        </View>
      </View>
      <View className="w-full items-center mt-5">
        <Text className="font-kregular text-xl">Traveler</Text>
        <View className="w-11/12 border-2 border-secondary rounded-md mt-2 h-14 p-3 justify-center focus:border-black">
          <Picker
            selectedValue={selectedTraveler}
            onValueChange={(value) => setSelectedTraveler(value)}
            style={{ height: 60, width: '100%' }}
          >
            <Picker.Item label="Select your traveler" value="null" />
            {SelectTravelList.map((item) => (
              <Picker.Item key={item.title} label={`${item.icon} \t ${item.title}`} value={item.title} />
            ))}
          </Picker>
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
          style="bg-primary mt-7 mb-40 w-3/5"
          handlePress={OnDateSelectionContinue}
        />
      </View>
    </View>
    </View>
  );

  return (
    <View className="bg-white">
      <View className="m-5 w-11/12 items-center">
        <Text className="font-kregular text-xl">Select A Destination</Text>
        <View className="w-full h-14 items-center mt-2 z-50 text-secondary">
          <SearchPlace />
        </View>
      </View>
    <FlatList
      data={[{ key: 'content' }]}
      renderItem={renderContent}
      keyExtractor={(item) => item.key}
    />
    </View>
  );
};

export default NewItinerary;