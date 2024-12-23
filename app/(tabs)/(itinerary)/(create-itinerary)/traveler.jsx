import { View, Text } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { Button } from '../../../../components';
import { useRouter } from 'expo-router';
import { CreateItineraryContext } from '../../../../context/CreateItineraryContext';
import { SelectTravelList } from '../../../../constants/option';
import RNPickerSelect from 'react-native-picker-select';

const SelectTraveler = () => {
  const router = useRouter();
  const [selectedTraveler, setSelectedTraveler] = useState();
  const { itineraryData, setItineraryData } = useContext(CreateItineraryContext);

  useEffect(() => {
    if (selectedTraveler) {
      setItineraryData({
        ...itineraryData,
        traveler: selectedTraveler,
      });
    }
  }, [selectedTraveler]);

  return (
    <View className="bg-white flex-1 p-5 h-full items-center justify-start">
      <View className="items-center">
        <Text className="text-3xl font-ksemibold">
          Who's Travelling
        </Text>
      </View>
      <View className="w-full mt-7">
        <RNPickerSelect
          onValueChange={(value) => setSelectedTraveler(value)}
          items={SelectTravelList.map((item) => ({
            label: `${item.icon} ${item.title} - ${item.desc}`,
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
      <Button
        title="Next"
        textColor="text-white"
        style="bg-primary w-3/4 mt-5"
        handlePress={() => router.push('(tabs)/(itinerary)/(create-itinerary)/budget')}
      />
    </View>
  );
};

export default SelectTraveler;