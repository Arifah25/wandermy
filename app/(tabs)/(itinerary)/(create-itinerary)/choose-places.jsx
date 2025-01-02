import { View, FlatList, ActivityIndicator, Text, SafeAreaView, TouchableOpacity, Modal, Image } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { useRouter } from 'expo-router';
import { PlaceCard, TabPlace, HeaderWithCart, Button, Search } from '../../../../components';
import { CreateItineraryContext } from '../../../../context/CreateItineraryContext';
import { CartContext } from "../../../../context/CartContext";
import { AI_PROMPT } from '../../../../constants/option';
import { chatSession } from '../../../../configs/AImodule';
import { setDoc, doc } from 'firebase/firestore';
import { auth, firestore } from '../../../../configs/firebaseConfig';
import { icons } from '../../../../constants';
import moment from 'moment';

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
  const { cart, addToCart, removeFromCart, clearCart } = useContext(CartContext);
  const user = auth.currentUser;

  const isNearby = (placeLocation, placeCoordinates, targetLocation, targetCoordinates, radius = 10) => {
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

  useEffect(() => {
    const db = getDatabase();
    const placesRef = ref(db, 'places');

    const unsubscribe = onValue(placesRef, (snapshot) => {
      const data = snapshot.val();
      const placesArray = data
        ? Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))
        : [];

      const targetCoordinates = { lat: 3.139, lng: 101.6869 };
      const targetLocation = 'Kuala Lumpur';

      const filtered = placesArray
        .filter(
          (place) =>
            place.category === activeTab &&
            place.status === 'approved' &&
            isNearby(
              place.address,
              { lat: place.latitude, lng: place.longitude },
              targetLocation,
              targetCoordinates
            )
        )
        .sort((a, b) => a.name.localeCompare(b.name));

      setPlaces(filtered);
      setFilteredPlaces(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
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

  const handlePlacePress = (place) => {
    router.push({
      pathname: '(tabs)/(itinerary)/(create-itinerary)/place-details',
      params: { ...place },
    });
  };

  const handleAddToCart = (place) => {
    addToCart({ 
      placeID : place.placeID, 
      name: place.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
    });
  };

  const handleRemoveFromCart = (placeID) => {
    removeFromCart(placeID);
  };

  const handleGenerateItinerary = async () => {
    setModalVisible(false)
    if (loading) return; // Prevent multiple executions while loading
    setLoading(true);

    const formattedPlaces = JSON.stringify(cart);

    console.log('Formatted Places:', formattedPlaces);

    try {
      const FINAL_PROMPT = AI_PROMPT
        .replace('{tripName}', itineraryData?.tripName || '')
        .replace('{destination}', itineraryData?.locationInfo?.name || '')
        .replace('{origin}',  'Penang, Malaysia')
        .replace('{places}', formattedPlaces || '')
        .replace('{totalDays}', itineraryData?.totalNoOfDays || 0)
        .replace('{totalNights}', (itineraryData?.totalNoOfDays || 1) - 1)
        .replace('{traveler}', itineraryData?.traveler || '')
        .replace('{budget}', itineraryData?.budget || '');

      console.log('AI Prompt:', FINAL_PROMPT);

      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const response = JSON.parse(result.response.text()); // Assuming JSON response

      console.log('AI Response:', response);

      const docId = Date.now().toString();
      await setDoc(doc(firestore, 'userItinerary', docId), {
        docId: docId,
        userEmail: user?.email,
        itineraryData: response,
        startDate: moment(itineraryData?.startDate).format('DD MMM '),
        endDate: moment(itineraryData?.endDate).format('DD MMM ')
      });
      // clearCart();
      router.push('(tabs)/(itinerary)/(create-itinerary)/review-itinerary');
    } catch (error) {
      console.error('Error generating itinerary:', error);
    } finally {
      setLoading(false);
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
                  handlePress={() => handlePlacePress(item)}
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