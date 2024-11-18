import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, Image, Modal, Text, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { getDatabase, ref, onValue } from 'firebase/database';
import { PlaceCard, Search, TabPlace } from '../../../components';
import { icons } from '../../../constants';

const HomeAdmin = () => {

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
      const filteredPlaces = placesArray.filter(place => place.category === activeTab && place.status === 'approved'); 

      setPlaces(filteredPlaces);
      setLoading(false); // Stop loading after data is fetched
    });

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, [activeTab]); // Re-fetch when activeTab changes

  // Handle pressing a place card to navigate to its details, passing all place data
  const handlePlacePress = (place) => {
    router.push({
      pathname: '(admin)/(home)/homedetails',
      params: { ...place }, // Pass all the place data as route params
    });
    console.log('Navigating to:', place); // Log the place details

  };

  const toggleModalVisibility = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleAdd = () => {
    toggleModalVisibility();
  };

  const addAttraction = () => {
    router.push("(admin)/(home)/(create)/attraction");
    toggleModalVisibility();
  };

  const addDining = () => {
    router.push("(admin)/(home)/(create)/dining");
    toggleModalVisibility();
  };

  const addEvent = () => {
    router.push("(admin)/(home)/(create)/event");
    toggleModalVisibility();
  };
  

return (
  <View
  className="bg-white h-full flex-1 p-5 items-center justify-start"
  >
   {/* <View
   className="flex-row items-center w-full justify-evenly"
   >
    <View>
      <Text>All Listings</Text>
    </View>
   </View>   */}
   {/* Category Tabs */}
   <TabPlace activeTab={activeTab} setActiveTab={setActiveTab} />

    {/* Places List or Loading Indicator */}
    <View className="h-full w-full mt-5">
      {loading ? (
        <ActivityIndicator size="large" color="#A91D1D" />
      ) : (
        <FlatList
          data={filteredPlaces.length > 0 ? filteredPlaces : places}
          renderItem={({ item }) => (
            <TouchableOpacity 
            onPress={() => handlePlacePress(item)}
            style={{
              padding: 15,
              borderBottomWidth: 1,
              borderBottomColor: '#ccc',
            }} // Styling for list items
            >
              {typeof item.name === 'string' ? (
                <Text>{item.name}</Text>
              ) : (
                <Text>Invalid Name</Text>
              )}
            </TouchableOpacity>

          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
    
    <TouchableOpacity
      className="absolute bottom-5 right-5 bg-primary p-4 rounded-full shadow-sm shadow-black"
      onPress={handleAdd}
    >
      <Image source={icons.plus} tintColor="#fff" className="w-7 h-7"/>
    </TouchableOpacity>   
    
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
    >
      <View className=" flex-1 justify-center items-center blur-xl">
        <View className="border bg-secondary w-[295px] h-[382px] p-[20px] rounded-[8px]">
          <TouchableOpacity
            onPress={toggleModalVisibility}
            className=" absolute top-6 right-6"
          >
            <Image source={icons.close} className="w-5 h-5 align-top"/>
          </TouchableOpacity>
          <Text className="mt-9 font-kregular text-2xl text-center">
            What listing do you want to apply for?
          </Text>
          <View className="flex-1 items-center mt-3">
            <View className="mt-4 bg-white items-center w-3/4 h-12 rounded-md justify-center">
              <TouchableOpacity 
              onPress={addAttraction}
              >
                <Text className="font-kregular text-xl">
                  Attraction
                </Text>
              </TouchableOpacity>
            </View>
            <View className="mt-4 bg-white items-center w-3/4 h-12 rounded-md justify-center">
              <TouchableOpacity 
              onPress={addDining}
              >
                <Text className="font-kregular text-xl">
                  Dining
                </Text>
              </TouchableOpacity>
            </View>
            <View className="mt-4 bg-white items-center w-3/4 h-12 rounded-md justify-center">
              <TouchableOpacity 
              onPress={addEvent}
              >
                <Text className="font-kregular text-xl">
                  Event
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  </View>
)
}

export default HomeAdmin

