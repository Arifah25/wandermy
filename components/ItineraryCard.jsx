import { View, Text, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const ItineraryCard = ({
    name,
    handlePress,
    handleDelete,
}) => {
  const confirmDelete = () => {
    Alert.alert(
      "Delete Itinerary",
      "Are you sure you want to delete this itinerary?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: handleDelete,
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View className="border-b-2 border-secondary">
        <View 
        className="flex-row items-center w-full justify-evenly py-4" 
        >
            <View className="w-10">
                <AntDesign name="calendar" size={24} color="black" />
            </View>
            <TouchableOpacity className="w-3/4"
            onPress={handlePress}>
            <Text
            className="text-base font-kregular"
            >
                {name} 
            </Text>
            </TouchableOpacity>
            <TouchableOpacity className=""
            onPress={confirmDelete}>
            <MaterialIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
        </View>
    </View>
  )
}

export default ItineraryCard;