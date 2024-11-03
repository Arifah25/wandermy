import { View, Text, FlatList } from 'react-native'
import React, { useContext, useEffect, useState } from 'react';
import { Button, OptionCard } from '../../../../components';
import { useNavigation, useRouter } from 'expo-router';
import { CreateItineraryContext } from '../../../../context/CreateItineraryContext';
import { SelectBudgetList } from '../../../../constants/option';
import { TouchableOpacity } from 'react-native';

const SelectBudget = () => {
    const router = useRouter();

    const [selectedBudget, setSelectedBudget] = useState();
    const {itineraryData, setItineraryData} = useContext(CreateItineraryContext);

    useEffect(() =>{
        selectedBudget&&setItineraryData({
            ...itineraryData,
          budget: selectedBudget
        })
      },[selectedBudget])

    return (
    <View
    className="bg-white flex-1 p-5 h-full items-center justify-start"
    >
      <Text
      className="text-3xl font-ksemibold"
      >
        Budget
      </Text>
      <Text
      className="font-kregular text-lg"
      >
        Choose your spending habits
      </Text>
      <View className="w-full mt-5">
        <FlatList
        data={SelectBudgetList}
        renderItem={({item, index}) => (
          <View className="items-center">
            <TouchableOpacity
            onPress={() => setSelectedBudget(item)}
            >
              <OptionCard 
              option={item}
              selected={selectedBudget}
              />
            </TouchableOpacity>
          </View>
        )}
        />
      </View>
      <Button
      title="Next"
      textColor="text-white"
      style="bg-primary w-3/4 mt-5"
      handlePress={() => router.push('(tabs)/(itinerary)/(create-itinerary)/reviewiti')}
      />
    </View>
    )
}

export default SelectBudget