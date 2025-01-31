import { View, Text, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';



const ItineraryCard = ({
    docId,
    rolePromise ,
    name,
    handlePress,
    handleDelete,
}) => {
  const router = useRouter(); 
  const [role, setRole] = useState(null);


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

  useEffect(() => {
    const resolveRole = async () => {
      const resolvedRole = await rolePromise;
      setRole(resolvedRole);
    };

    resolveRole();
  }, [rolePromise]);

  const handleEdit = () => {
    router.push({
      pathname: '(tabs)/(itinerary)/(create-itinerary)/review-itinerary',
      params: { docId },
    });

    console.log(role);
  };

  return (
    <View className="border-b-2 border-secondary">
        <View 
        className="flex-row items-center w-full justify-evenly py-4" 
        >
            <View className="w-10">
                <AntDesign name="calendar" size={24} color="black" />
            </View>
            <TouchableOpacity className={role !== 'owner' ? 'w-3/5' : 'w-3/5'}
            onPress={handlePress}>
            <Text
            className="text-base font-kregular"
            >
                {name} 
            </Text>
            </TouchableOpacity>
            <View className="flex-row items-end justify-end w-1/6">
            {role !== 'viewer' && (
              <TouchableOpacity className="" onPress={handleEdit}>
                <MaterialIcons name="edit" size={24} color="black" />
              </TouchableOpacity>
            )}
            {role === 'owner' && (<TouchableOpacity className="ml-3"
            onPress={confirmDelete}>
            <MaterialIcons name="delete" size={24} color="red" />
            </TouchableOpacity>)}
            </View>
            
        </View>
    </View>
  )
}

export default ItineraryCard;