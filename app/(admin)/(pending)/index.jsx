import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, Image, Modal, Text, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { getDatabase, ref, onValue } from 'firebase/database';
import { PlaceCard, Search, TabPlace } from '../../../components';
import { icons } from '../../../constants';

const PendingAdmin = () => {

  const [places, setPlaces] = useState([]); // State to store places data
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [activeTab, setActiveTab] = useState('attraction'); // Active category tab
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filteredPlaces, setFilteredPlaces] = useState([]); // State to store filtered places
  const router = useRouter(); // Navigation handler

  // Fetch data based on the active category
  useEffect(() => {
    setLoading(true);
    const db = getDatabase();

    // Switch between the different categories: 'attractions', 'dining', and 'events'
    const placesRef = ref(db, 'places'); // Assuming all places are under one 'places' node
    
    const unsubscribe = onValue(placesRef, (snapshot) => {
      const data = snapshot.val();
      const placesArray = data
        ? Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))
        : [];
      
      // Filter the data based on the selected tab/category
      const filteredPlaces = placesArray.filter(place => place.category === activeTab && place.status === 'pending'); 

      setPlaces(filteredPlaces);
      setLoading(false); // Stop loading after data is fetched
    });

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, [activeTab]); // Re-fetch when activeTab changes

  // Handle pressing a place card to navigate to its details, passing all place data
  const handlePlacePress = (place) => {
    // console.log('Navigating to:', place); // Log the place details
    router.push({
      pathname: '/(admin)/(pending)/pendingdetails',
      params: { ...place }, // Pass all the place data as route params
    });
  };
  

return (
  <View
  className="bg-white h-full flex-1 p-5 items-center justify-start"
  > 
   {/* Category Tabs */}
   <TabPlace activeTab={activeTab} setActiveTab={setActiveTab} />

    {/* Places List or Loading Indicator */}
    <View className="h-full w-full mt-2" style={{ paddingBottom: 65, paddingTop: 10 }}>
      {loading ? (
        // Show spinner while data is loading
        <ActivityIndicator size="large" color="#A91D1D" />
      ) : filteredPlaces.length > 0 || (filteredPlaces.length === 0 && places.length > 0) ? (
        // Show FlatList if there is data
        <FlatList
          data={filteredPlaces.length > 0 ? filteredPlaces : places}
          renderItem={({ item }) => (
            <PlaceCard
              name={item.name} // Display place name
              image={item.poster ? item.poster[0] : null} // Display poster image
              handlePress={() => handlePlacePress(item)} // Pass all item data to the details page
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginHorizontal: 12,
            marginTop: 10,
          }}
        />
      ) : (
        // Show "No pending requests" message if no data
        <Text className="text-lg text-gray-500 mt-10 text-center">
          No pending requests
        </Text>
      )}
    </View>
  </View>
)
}

export default PendingAdmin

