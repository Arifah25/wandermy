import { View, Text, FlatList } from 'react-native'
import React, { useContext, useEffect, useState } from 'react';
import { Button, OptionCard, SearchPlace } from '../../../../components';
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
      <SearchPlace />
    </View>
    )
}

export default SelectBudget