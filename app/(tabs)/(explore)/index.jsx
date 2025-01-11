import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, Image, Modal, Text, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth'; // Ensure this is imported
import { getDatabase, ref, onValue, get, push, set } from 'firebase/database';
import { PlaceCard, Search, TabPlace } from '../../../components';
import { icons } from '../../../constants';

const logUserInteraction = async (placeID) => {
  const db = getDatabase();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (!userId) return; // Ensure user is logged in

  try {
    const interactionRef = ref(db, `user_interactions/${userId}`);

    // Fetch existing interactions
    const snapshot = await get(interactionRef);
    const interactions = snapshot.val();

    if (interactions) {
      const interactionEntries = Object.entries(interactions); // Convert to an array of [key, value]

      // If there are 10 or more interactions, find the oldest one by timestamp and delete it
      if (interactionEntries.length >= 10) {
        const oldestInteraction = interactionEntries.reduce((oldest, current) =>
          new Date(oldest[1].timestamp) < new Date(current[1].timestamp) ? oldest : current
        );

        const oldestKey = oldestInteraction[0]; // Get the key of the oldest interaction
        await set(ref(db, `user_interactions/${userId}/${oldestKey}`), null); // Delete the oldest interaction
      }
    }

    // Add the new interaction
    const newInteractionRef = push(interactionRef);
    await set(newInteractionRef, {
      placeID,
      timestamp: new Date().toISOString(),
    });

    console.log("User interaction logged successfully.");
  } catch (error) {
    console.error("Error logging user interaction:", error);
  }
};

const Explore = () => {
 
  const [places, setPlaces] = useState([]); // State to store places data
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [activeTab, setActiveTab] = useState('attraction'); // Active category tab
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filteredPlaces, setFilteredPlaces] = useState([]); // State to store filtered places
  const [sortOrder, setSortOrder] = useState('asc'); // Sorting state
  const [isSortModalVisible, setIsSortModalVisible] = useState(false); // Sorting modal visibility
  const router = useRouter(); // Navigation handler


  // Fetch data based on the active category
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const db = getDatabase();
      const placesRef = ref(db, "places");
      const eventRef = ref(db, "event");
  
      try {
        // Fetch places
        const placesSnapshot = await get(placesRef);
        const placesData = placesSnapshot.val();
        const placesArray = placesData
          ? Object.keys(placesData).map((key) => ({
              id: key,
              ...placesData[key],
            }))
          : [];
  
        // Fetch event data
        const eventSnapshot = await get(eventRef);
        const eventData = eventSnapshot.val();
  
        // Combine places with event data
        const combinedData = placesArray.map((place) => ({
          ...place,
          eventDetails: eventData ? eventData[place.id] : null, // Match event data with place ID
        }));  
  
      let filteredPlaces;
  
      if (activeTab === "event") {
        // Fetch events data
        filteredPlaces = combinedData.filter((item) => {
          if (
            item.category === "event" &&
            item.status === "approved" &&
            item.eventDetails &&
            item.eventDetails.startDate &&
            item.eventDetails.endDate
          ) {
            const [startDay, startMonth, startYear] = item.eventDetails.startDate
              .split("/")
              .map(Number);
            const [endDay, endMonth, endYear] = item.eventDetails.endDate
              .split("/")
              .map(Number);
  
            const startDate = new Date(startYear, startMonth - 1, startDay);
            const endDate = new Date(endYear, endMonth - 1, endDay);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
  
            return endDate >= today;
          }
          return false;
        });
      } else {
        // Fetch data for other categories
        filteredPlaces = placesArray.filter(
          (place) =>
            place.category === activeTab && place.status === "approved"
        );
      }
      setPlaces(filteredPlaces); // Update state with filtered places
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [activeTab]);  // Re-fetch when activeTab changes

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
      case 'latest': // Sort by dateApproved (latest first)
        sorted = [...filteredPlaces].sort((a, b) => new Date(b.dateApproved) - new Date(a.dateApproved));
        break;
      case 'oldest': // Sort by dateApproved (oldest first)
        sorted = [...filteredPlaces].sort((a, b) => new Date(a.dateApproved) - new Date(b.dateApproved));
        break;  
    }
    setSortOrder(order);
    setFilteredPlaces(sorted);
    setIsSortModalVisible(false); // Close the modal after sorting
  };

  useEffect(() => {
    if (places.length > 0) {
      FastImage.preload(
        places.map((place) => ({
          uri: place.poster ? place.poster[0] : '',
        }))
      );
    }
  }, [places]);

  // Handle pressing a place card to navigate to its details, passing all place data
  const handlePlacePress = (item) => {
    logUserInteraction(item.id);
    router.push({
      pathname: '(tabs)/(explore)/details',
      params: { ...item }, // Pass data to the details page
    });
  };

  const toggleSortModal = () => {
    setIsSortModalVisible(!isSortModalVisible);
  };


  const toggleModalVisibility = () => {
    setIsModalVisible(!isModalVisible);
  };


  const handleAdd = () => {
    toggleModalVisibility();
  };


  const addAttraction = () => {
    router.push("(tabs)/(explore)/(create)/attraction");
    toggleModalVisibility();
  };


  const addDining = () => {
    router.push("(tabs)/(explore)/(create)/dining");
    toggleModalVisibility();
  };


  const addEvent = () => {
    router.push("(tabs)/(explore)/(create)/event");
    toggleModalVisibility();
  };


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="bg-white flex-1 p-5 items-center justify-start">
        <View className="flex-row items-center w-full justify-evenly">
          <Search
          width="w-5/6"
          places={places} // Pass the places data
          activeTab={activeTab} // Pass the active category
          setFilteredPlaces={setFilteredPlaces}
          />
          {/* Sorting Button */}
          <TouchableOpacity onPress={toggleSortModal} className="w-1/6 items-center">
            <Image
              source={icons.filter}
              className="w-8 h-8"
              tintColor="black"
            />
          </TouchableOpacity>
        </View>  


        {/* Category Tabs */}
        <TabPlace activeTab={activeTab} setActiveTab={setActiveTab} />


        {/* Places List or Loading Indicator */}
        <View className="h-full w-full mt-2 " style={{ paddingBottom: 120, paddingTop: 10 }}>
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
                  <TouchableOpacity onPress={addAttraction}>
                    <Text className="font-kregular text-xl">
                      Attraction
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="mt-4 bg-white items-center w-3/4 h-12 rounded-md justify-center">
                  <TouchableOpacity onPress={addDining}>
                    <Text className="font-kregular text-xl">
                      Dining
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="mt-4 bg-white items-center w-3/4 h-12 rounded-md justify-center">
                  <TouchableOpacity onPress={addEvent}>
                    <Text className="font-kregular text-xl">
                      Event
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>


        {/* Sort Modal */}
        <Modal visible={isSortModalVisible} transparent animationType="slide">
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="w-3/4 bg-white p-6 rounded-lg">
              <Text className="text-lg font-bold mb-4">Sort By</Text>
              <TouchableOpacity onPress={() => sortData('asc')} className="mb-3">
                <Text className="text-base">Ascending (A-Z)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sortData('desc')} className="mb-3">
                <Text className="text-base">Descending (Z-A)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sortData('latest')} className="mb-3">
                <Text className="text-base">Date posted: Latest</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => sortData('oldest')} className="mb-3">
                <Text className="text-base">Date posted: Oldest</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleSortModal} className="mt-4">
                <Text className="text-center text-red-500">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}


export default Explore
