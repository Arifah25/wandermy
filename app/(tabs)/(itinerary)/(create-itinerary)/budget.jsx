import { View, Text } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { Button } from '../../../../components';
import { useRouter } from 'expo-router';
import { CreateItineraryContext } from '../../../../context/CreateItineraryContext';
import { SelectBudgetList } from '../../../../constants/option';
import RNPickerSelect from 'react-native-picker-select';

const SelectBudget = () => {
  const router = useRouter();
  const [selectedBudget, setSelectedBudget] = useState();
  const { itineraryData, setItineraryData } = useContext(CreateItineraryContext);

  useEffect(() => {
    if (selectedBudget) {
      setItineraryData({
        ...itineraryData,
        budget: selectedBudget,
      });
    }
  }, [selectedBudget]);

  return (
    <View className="bg-white flex-1 p-5 h-full items-center justify-start">
      <Text className="text-3xl font-ksemibold text-center">
        Choose your spending habits
      </Text>
      <View className="w-full mt-7">
        <RNPickerSelect
          onValueChange={(value) => setSelectedBudget(value)}
          items={SelectBudgetList.map((item) => ({
            label: `${item.icon} ${item.title} - ${item.desc}`,
            value: item.title,
          }))}
          placeholder={{ label: 'Select your budget', value: null }}
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
        handlePress={() => router.push('(tabs)/(itinerary)/(create-itinerary)/reviewdetails')}
      />
    </View>
  );
};

export default SelectBudget;