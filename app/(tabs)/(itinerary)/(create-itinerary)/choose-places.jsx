import { View, FlatList, ActivityIndicator, TouchableOpacity, Image, Modal, Text, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react'
import { getDatabase, ref, onValue } from 'firebase/database';
import { useRouter } from 'expo-router';
import { PlaceCard, TabPlace } from '../../../../components';

const ChoosePlaces = () => {
  const [places, setPlaces] = useState([]); // State to store places data
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [activeTab, setActiveTab] = useState('attraction'); // Active category tab
  const [filteredPlaces, setFilteredPlaces] = useState([]); // State to store filtered places
  const [sortOrder, setSortOrder] = useState('asc'); // Sorting state
  const [isSortModalVisible, setIsSortModalVisible] = useState(false); // Sorting modal visibility
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
      const filteredPlaces = placesArray.filter(place => place.category === activeTab && place.status === 'approved'); 

      setPlaces(filteredPlaces);
      setLoading(false); // Stop loading after data is fetched
    });

    
    // Clean up the listener on unmount
    return () => unsubscribe();
  }, [activeTab]); // Re-fetch when activeTab changes

  // Sorting Function
  const sortData = (order) => {
    let sorted;

    switch (order) {
      case 'asc':
        sorted = [...filteredPlaces].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'desc':
        sorted = [...filteredPlaces].sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
    setSortOrder(order);
    setFilteredPlaces(sorted);
    setIsSortModalVisible(false); // Close the modal after sorting
  };

  // Handle pressing a place card to navigate to its details, passing all place data
  const handlePlacePress = (place) => {
    router.push({
      pathname: '(tabs)/(itinerary)/(create-itinerary)/details',
      params: { ...place }, // Pass all the place data as route params
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="bg-white flex-1 p-5 items-center justify-start">
        {/* Category Tabs */}
        <TabPlace activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Places List or Loading Indicator */}
        <View className="h-full w-full mt-5 bottom-5" style={{ paddingBottom: 110, paddingTop: 10 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#A91D1D" />
          ) : (
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
              columnWrapperStyle={{ justifyContent: 'space-between', marginHorizontal: 12, marginTop: 10 }}
            />
          )}
        </View> 
      </View>
    </SafeAreaView>
  )
}

export default ChoosePlaces