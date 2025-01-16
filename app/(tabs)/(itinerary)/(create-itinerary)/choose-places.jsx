import { View, FlatList, ActivityIndicator, Text, SafeAreaView, TouchableOpacity, Modal, Image } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { useRouter } from 'expo-router';
import { PlaceCard, TabPlace, HeaderWithCart, Button, Search } from '../../../../components';
import { CreateItineraryContext } from '../../../../context/CreateItineraryContext';
import { CartContext } from "../../../../context/CartContext";
import { AI_PROMPT } from '../../../../constants/option';
import { chatSession } from '../../../../configs/AImodule';
import { setDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../../../../configs/firebaseConfig';
import { icons } from '../../../../constants';
import moment from 'moment';
import { useRoute } from '@react-navigation/native';

const ChoosePlaces = () => {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attraction');
  const [modalVisible, setModalVisible] = useState(false);
  const [bookmarkVisible, setBookmarkVisible] = useState(false);
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState([]);
  const router = useRouter();
  const { itineraryData, setItineraryData } = useContext(CreateItineraryContext);
  const { cart, addToCart, removeFromCart, clearCart, setCartData } = useContext(CartContext);
  const user = auth.currentUser;
  const route = useRoute();
  const { docId, cartD, destination, lat, long, startDate, endDate, info } = route.params; 

  const isNearby = (placeLocation, placeCoordinates, targetLocation, targetCoordinates, radius = 30) => {
    if (!placeLocation || !targetLocation || !placeCoordinates || !targetCoordinates) return false;

    const isNameNearby =
      placeLocation.toLowerCase().includes(targetLocation.toLowerCase()) ||
      targetLocation.toLowerCase().includes(placeLocation.toLowerCase());

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const toRadians = (deg) => deg * (Math.PI / 180);
      const R = 6371;
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const isWithinRadius =
      calculateDistance(placeCoordinates.lat, placeCoordinates.lng, targetCoordinates.lat, targetCoordinates.lng) <=
      radius;

    return isNameNearby || isWithinRadius;
  };

  const orderedDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  useEffect(() => {
    const fetchData = async () => {
      if (cartD) {
        setCartData(JSON.parse(cartD));
      }
      setLoading(true);
      const db = getDatabase();
      const placesRef = ref(db, "places");
      const eventRef = ref(db, "event");
      const operatingHoursRef = ref(db, "operatingHours");

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

        // Fetch operating hours
        const operatingHoursSnapshot = await get(operatingHoursRef);
        const operatingHoursData = operatingHoursSnapshot.val();

        // Convert trip dates into weekdays (MON, TUE, etc.)
        let tripStartDate = moment(itineraryData?.startDate);
        let tripEndDate = moment(itineraryData?.endDate);

        if (startDate && endDate) {
          tripStartDate = moment(startDate, "DD MMM YYYY");
          tripEndDate = moment(endDate, "DD MMM YYYY");
        }

        const tripDays = [];
        let tempDate = tripStartDate.clone();
        while (tempDate.isSameOrBefore(tripEndDate, "day")) {
          tripDays.push(tempDate.format("ddd").toUpperCase()); // Convert to MON, TUE, etc.
          tempDate.add(1, "day");
        }

        // Combine places with event and operating hours data
        const combinedData = placesArray.map((place) => ({
          ...place,
          eventDetails: eventData ? eventData[place.id] : null, // Match event data with place ID
          operatingHours: operatingHoursData ? operatingHoursData[place.id] : null, // Match operating hours
        }));

        let filteredPlaces;

        if (activeTab === "event") {
          // Filter events data
          filteredPlaces = combinedData.filter((item) => {
            if (
              item.category === "event" &&
              item.status === "approved" &&
              item.eventDetails &&
              item.eventDetails.startDate &&
              item.eventDetails.endDate
            ) {
              // Parse event start and end dates
              const eventStartDate = moment(item.eventDetails.startDate, "DD/MM/YYYY");
              const eventEndDate = moment(item.eventDetails.endDate, "DD/MM/YYYY");

              return (
                eventEndDate.isSameOrAfter(tripStartDate) &&
                eventStartDate.isSameOrBefore(tripEndDate)
              );
            }
            return false;
          });
        } else {
          // Filtering based on activeTab and operating hours matching the trip days
          filteredPlaces = combinedData.filter((place) => {
            if (place.category !== activeTab || place.status !== "approved") {
              return false;
            }

            // Ensure place has operating hours
            if (!place.operatingHours) {
              return false;
            }

            // Check if the place is open on at least one trip day
            return tripDays.some((day) => {
              const dayData = place.operatingHours[day];
              return dayData && dayData.isOpen;
            });
          });

          // Sorting based on distance if needed
          let targetCoordinates;
          if (lat && long) {
            targetCoordinates = { lat: parseFloat(lat), lng: parseFloat(long) };
          } else {
            targetCoordinates = itineraryData?.locationInfo?.coordinates;
          }
          const targetLocation = destination || itineraryData?.locationInfo?.name;

          console.log("Target Coordinates:", targetCoordinates);
          console.log("Target Location:", targetLocation);

          filteredPlaces = filteredPlaces
            .filter((place) =>
              isNearby(
                place.address,
                { lat: place.latitude, lng: place.longitude },
                targetLocation,
                targetCoordinates
              )
            )
            .sort((a, b) => a.name.localeCompare(b.name));
        }

        setPlaces(filteredPlaces);
        setFilteredPlaces(filteredPlaces);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, itineraryData?.locationInfo]);

  

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;

      const db = getDatabase();
      const bookmarksRef = ref(db, `bookmark/${user.uid}`);
      const snapshot = await get(bookmarksRef);
      const bookmarks = snapshot.val() || {};

      const bookmarkIds = Object.keys(bookmarks);

      if (bookmarkIds.length === 0) {
        setBookmarkedPlaces([]);
        return;
      }

      const placesPromises = bookmarkIds.map(async (placeID) => {
        const placeRef = ref(db, `places/${placeID}`);
        const placeSnapshot = await get(placeRef);
        const placeData = placeSnapshot.val();
        return placeData ? { id: placeID, ...placeData } : null;
      });

      const placesData = await Promise.all(placesPromises);
      const validPlaces = placesData.filter((place) => place !== null);

      setBookmarkedPlaces(validPlaces);
    };

    fetchBookmarks();
  }, [user]);

  const handlePlacePress = (place, docId) => {
    router.push({
      pathname: '(tabs)/(itinerary)/(create-itinerary)/place-details',
      params: { ...place, docId },
    });
  };

  const handleAddToCart = (place) => {
    addToCart({ 
      placeID : place.placeID, 
      name: place.name,
      category: place.category,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
    });
  };

  const handleRemoveFromCart = (placeID) => {
    removeFromCart(placeID);
    Alert.alert('Place removed from cart successfully.');
  };

  const handleMakeItinerary = () => {

  };

  const handleGenerateItinerary = async () => {
    setModalVisible(false)
    if (loading) return; // Prevent multiple executions while loading
    setLoading(true);

    if (cart.length === 0) {
      setLoading(false);
      Alert.alert('No places added', 'Please add some places to generate itinerary');  
    }
    else{
      const formattedPlaces = JSON.stringify(cart);

      console.log('Formatted Places:', formattedPlaces);

      try {
        const FINAL_PROMPT = AI_PROMPT
          .replace('{tripName}', itineraryData?.tripName || '')
          .replace('{destination}', destination || itineraryData?.locationIfo?.name || '')
          .replace('{origin}',  'Penang, Malaysia')
          .replace('{places}', formattedPlaces || '')
          .replace('{totalDays}', itineraryData?.totalNoOfDays || 0)
          .replace('{totalNights}', (itineraryData?.totalNoOfDays || 1) - 1)
          .replace('{traveler}', itineraryData?.traveler || info?.traveler || '')
          .replace('{budget}', itineraryData?.budget || info?.budget || '');

        console.log('AI Prompt:', FINAL_PROMPT);

        // const result = await chatSession.sendMessage(FINAL_PROMPT);
        const response = JSON.parse(result.response.text()); // Assuming JSON response

        console.log('AI Response:', response);

        if (docId) {
          const docRef = doc(firestore, 'userItinerary', docId); // Use existing docId
          await updateDoc(docRef, {
            itineraryData: response,
            cart: formattedPlaces,
          });
          router.push({
            pathname: '(tabs)/(itinerary)/(create-itinerary)/review-itinerary',
            params: { docId },
          });
        } else{
          const docId = Date.now().toString();
          await setDoc(doc(firestore, 'userItinerary', docId), {
            docId: docId,
            userEmail: user?.email,
            cart: formattedPlaces,
            info: itineraryData?.locationInfo,
            itineraryData: response,
            startDate: moment(itineraryData?.startDate).format('DD MMM YYYY'),
            endDate: moment(itineraryData?.endDate).format('DD MMM YYYY')
        });
        router.push({
          pathname: '(tabs)/(itinerary)/(create-itinerary)/review-itinerary',
          params: { docId },
        });
        }
        clearCart();

      } catch (error) {
        console.error('Error generating itinerary:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBookmarkPress = () => {
    setBookmarkVisible(!bookmarkVisible);
  };

  const getFilteredPlaces = () => {
    return bookmarkVisible
      ? bookmarkedPlaces.filter((place) => place.category === activeTab)
      : filteredPlaces;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderWithCart onCartPress={() => setModalVisible(true)} />
      <View className="flex-1 px-5">
        <View className="flex-row items-center mt-5 justify-center">
          <Search 
            width="w-4/5"
            places={places} // Pass the places data
            activeTab={activeTab} // Pass the active category
            setFilteredPlaces={setFilteredPlaces}
          />
          {/* Bookmark Button */}
          <TouchableOpacity onPress={handleBookmarkPress} className="w-1/6 items-center">
            <Image
              source={bookmarkVisible? icons.bookmarked : icons.bookmark}
              className="w-8 h-9"
              tintColor="black"
            />
          </TouchableOpacity>
        </View>  
        <TabPlace activeTab={activeTab} setActiveTab={setActiveTab} />
        <View style={{ flex: 1, marginTop: 16 }}>
          {loading ? (
            <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#A91D1D" />
            </View>
          ) : (
            <FlatList
              data={getFilteredPlaces()}
              renderItem={({ item }) => (
                <PlaceCard
                  name={item.name}
                  image={item.poster ? item.poster[0] : null}
                  handlePress={() => handlePlacePress(item, docId)}
                  handleAddToCart={() => handleAddToCart(item)}
                />
              )}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between', marginHorizontal: 12, marginTop: 10 }}
            />
          )}
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end  p-1 ">
          <View className="bg-white p-5 rounded-t-lg border-t-2 ">
            <Text className="text-lg font-ksemibold mb-3">Your Itinerary</Text>
            {cart.length === 0 ? (
              <Text>No places added yet</Text>
            ) : (
              cart.map((item, index) => (
                <View key={index} className="mb-2 flex-row justify-between items-center">
                  <Text className="font-kregular">{item.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveFromCart(item.placeID)}>
                    <Text className="text-red-500">Remove</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
            <View className="w-full mt-5 items-center h-16">
              <Button
                title={loading ? 'Generating...' : 'Generate Itinerary'}
                textColor="text-white"
                style="bg-primary w-4/5 mt-5"
                handlePress={handleGenerateItinerary}
                // handlePress={console.log(cart)}
                disabled={loading} // Disable button while loading
              />
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className=" absolute top-6 right-6"
              >
                <Image source={icons.close} className="w-5 h-5 align-top"/>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default ChoosePlaces;