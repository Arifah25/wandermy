import { View, FlatList, ActivityIndicator, Text, SafeAreaView, TouchableOpacity, Modal, Image, Alert } from 'react-native';
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
  const { docId, cartD, destination, lat, long, startDate, endDate, days } = route.params; 
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Add the other helper functions here
  const PLACE_DURATION = {
    attraction: 120,
    restaurant: 60,
    cafe: 45,
    event: 180,
  };

  const MEAL_TIMES = {
    breakfast: { start: 8, end: 10 },
    lunch: { start: 12, end: 14 },
    dinner: { start: 18, end: 20 }
  };

  const groupPlacesByProximity = (places, maxDistance = 5) => {
    console.log('🗺️ Starting proximity grouping with', places.length, 'places');
    
    if (!places.length) return [];

    const groups = [];
    const used = new Set();

    // Sort places by those with valid coordinates first
    const validPlaces = places.filter(place => 
      place.latitude && place.longitude && 
      !isNaN(parseFloat(place.latitude)) && 
      !isNaN(parseFloat(place.longitude))
    );

    console.log('📍 Valid places with coordinates:', validPlaces.length);

    validPlaces.forEach((centerPlace, index) => {
      if (used.has(centerPlace.placeID)) return;

      const group = {
        center: centerPlace,
        places: [centerPlace],
        categories: new Set([centerPlace.category])
      };
      used.add(centerPlace.placeID);

      validPlaces.forEach((otherPlace) => {
        if (used.has(otherPlace.placeID)) return;

        const distance = calculateDistance(
          parseFloat(centerPlace.latitude),
          parseFloat(centerPlace.longitude),
          parseFloat(otherPlace.latitude),
          parseFloat(otherPlace.longitude)
        );

        if (distance <= maxDistance) {
          group.places.push(otherPlace);
          group.categories.add(otherPlace.category);
          used.add(otherPlace.placeID);
        }
      });

      // Only add groups that have a good mix of places
      if (group.places.length >= 2) {
        console.log(`✅ Found group with ${group.places.length} places around ${centerPlace.name}`);
        groups.push(group);
      }
    });

    // Sort groups by the number of different categories they contain
    groups.sort((a, b) => b.categories.size - a.categories.size);
    
    console.log('🏘️ Created', groups.length, 'proximity groups');
    return groups;
  };

  const isPlaceOpen = (place, date, time) => {
    if (!place.operatingHours) {
      const visitTime = moment(time, 'HH:mm');
      const defaultOpenTime = moment('09:00', 'HH:mm');
      const defaultCloseTime = moment('22:00', 'HH:mm');
      return visitTime.isBetween(defaultOpenTime, defaultCloseTime);
    }

    const dayOfWeek = date.format('ddd').toUpperCase();
    const operatingHours = place.operatingHours?.[dayOfWeek];
    
    if (!operatingHours || !operatingHours.isOpen) {
      const visitTime = moment(time, 'HH:mm');
      const defaultOpenTime = moment('09:00', 'HH:mm');
      const defaultCloseTime = moment('22:00', 'HH:mm');
      return visitTime.isBetween(defaultOpenTime, defaultCloseTime);
    }
    
    const openTime = moment(operatingHours.openTime, 'HH:mm');
    const closeTime = moment(operatingHours.closeTime, 'HH:mm');
    const visitTime = moment(time, 'HH:mm');
    
    return visitTime.isBetween(openTime, closeTime);
  };
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

  const findNearestHotels = async (latitude, longitude) => {
    try {
      console.log('🏨 Finding nearby hotels...');
      console.log('📍 Coordinates:', latitude, longitude);
        const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY;
        // Make API request to Google Places
        const radius = 5000; // 5 km
        const type = 'lodging';

        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        // Handle results
        if (data.results && data.results.length > 0) {
            return data.results.slice(0, 3).map(place => ({
                name: place.name,
                address: place.vicinity,
                rating: place.rating || 'N/A'
            }));
            console.log('🏨 Nearby hotels:', data.results);
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching nearby hotels:', error);
        return [];
    }
};

  // Add meal type detection helper function
  const getMealType = (place) => {
    if (!place.tags) return null;
    
    const tags = place.tags.toLowerCase().split(' ');
    if (tags.includes('breakfast') || tags.includes('brunch')) {
      return 'breakfast';
    }
    if (tags.includes('lunch')) {
      return 'lunch';
    }
    if (tags.includes('dinner')) {
      return 'dinner';
    }
    return null;
  };

  const handleGenerateItinerary = async () => {
    setModalVisible(false);
    if (loading) return;
    setLoading(true);

    console.log('🚀 Starting itinerary generation...');
    // console.log('📋 Cart items:', cart);

    if (cart.length === 0) {
      setLoading(false);
      Alert.alert('No places added', 'Please add some places to generate itinerary');
      return;
    }

    try {
      const totalDays = itineraryData?.totalNoOfDays || days;
      console.log('📅 Total days to plan:', totalDays);
      
      const generatedItinerary = { days: [] };
      
      // First, create a copy of all places to ensure we use them all
      const allPlaces = [...cart];
      const proximityGroups = groupPlacesByProximity(allPlaces);

      // Create a more even distribution of places across days
      const placesPerDay = Math.ceil(allPlaces.length / totalDays);
      console.log(`📊 Aiming for ~${placesPerDay} places per day`);

      // Create an array to track unused places
      let unusedPlaces = [...allPlaces];

      for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
        console.log(`\n📆 Planning Day ${dayIndex + 1}...`);
        
        const currentDate = moment(itineraryData?.startDate || startDate).add(dayIndex, 'days');
        const dayPlaces = [];
        let currentTime = moment('09:00', 'HH:mm');

        // Get places for this day
        let placesToSchedule = [];
        
        // First, try to get a proximity group
        const dayGroup = proximityGroups[dayIndex % proximityGroups.length];
        if (dayGroup) {
            const groupPlaces = dayGroup.places.filter(p => 
                unusedPlaces.some(up => up.placeID === p.placeID)
            );
            placesToSchedule.push(...groupPlaces);
            // Remove used places from unusedPlaces
            unusedPlaces = unusedPlaces.filter(p => 
                !groupPlaces.some(gp => gp.placeID === p.placeID)
            );
        }

        // If we need more places, get them from unused places
        const remainingNeeded = placesPerDay - placesToSchedule.length;
        if (remainingNeeded > 0 && unusedPlaces.length > 0) {
            const additionalPlaces = unusedPlaces.splice(0, remainingNeeded);
            placesToSchedule.push(...additionalPlaces);
        }

        console.log(`🎯 Total places to schedule for day ${dayIndex + 1}: ${placesToSchedule.length}`);

        // Sort places by category for scheduling
        const dayRestaurants = placesToSchedule.filter(p => 
          p.category === 'dining' || p.category === 'restaurant'
        );
        const dayAttractions = placesToSchedule.filter(p => 
          p.category === 'attraction'
        );
        const dayEvents = placesToSchedule.filter(p => 
          p.category === 'event'
        );

        // Categorize restaurants by meal type
        const breakfastPlaces = dayRestaurants.filter(p => getMealType(p) === 'breakfast');
        const lunchPlaces = dayRestaurants.filter(p => getMealType(p) === 'lunch');
        const dinnerPlaces = dayRestaurants.filter(p => getMealType(p) === 'dinner');
        const uncategorizedRestaurants = dayRestaurants.filter(p => !getMealType(p));

        console.log('🍽️ Restaurants by meal type:', {
          breakfast: breakfastPlaces.length,
          lunch: lunchPlaces.length,
          dinner: dinnerPlaces.length,
          uncategorized: uncategorizedRestaurants.length
        });

        // Schedule breakfast
        let breakfast;
        if (breakfastPlaces.length > 0) {
          breakfast = breakfastPlaces.shift();
        } else if (uncategorizedRestaurants.length > 0) {
          breakfast = uncategorizedRestaurants.shift();
        }
        
        if (breakfast) {
          currentTime = moment('09:00', 'HH:mm');
          dayPlaces.push({
            ...breakfast,
            visitTime: currentTime.format('HH:mm'),
            duration: PLACE_DURATION.restaurant,
            mealType: 'breakfast'
          });
          currentTime.add(PLACE_DURATION.restaurant, 'minutes');
        }

        // Morning activities (2 attractions max)
        let morningAttractions = dayAttractions.splice(0, 2);
        for (const attraction of morningAttractions) {
          dayPlaces.push({
            ...attraction,
            visitTime: currentTime.format('HH:mm'),
            duration: PLACE_DURATION.attraction
          });
          currentTime.add(PLACE_DURATION.attraction, 'minutes');
        }

        // Schedule lunch
        let lunch;
        if (lunchPlaces.length > 0) {
          lunch = lunchPlaces.shift();
        } else if (uncategorizedRestaurants.length > 0) {
          lunch = uncategorizedRestaurants.shift();
        }

        if (lunch) {
          currentTime = moment('12:30', 'HH:mm');
          dayPlaces.push({
            ...lunch,
            visitTime: currentTime.format('HH:mm'),
            duration: PLACE_DURATION.restaurant,
            mealType: 'lunch'
          });
          currentTime.add(PLACE_DURATION.restaurant, 'minutes');
        }

        // Afternoon activities (2 attractions max)
        let afternoonAttractions = dayAttractions.splice(0, 2);
        for (const attraction of afternoonAttractions) {
          dayPlaces.push({
            ...attraction,
            visitTime: currentTime.format('HH:mm'),
            duration: PLACE_DURATION.attraction
          });
          currentTime.add(PLACE_DURATION.attraction, 'minutes');
        }

        // Schedule dinner
        let dinner;
        if (dinnerPlaces.length > 0) {
          dinner = dinnerPlaces.shift();
        } else if (uncategorizedRestaurants.length > 0) {
          dinner = uncategorizedRestaurants.shift();
        }

        if (dinner) {
          currentTime = moment('18:30', 'HH:mm');
          dayPlaces.push({
            ...dinner,
            visitTime: currentTime.format('HH:mm'),
            duration: PLACE_DURATION.restaurant,
            mealType: 'dinner'
          });
          currentTime.add(PLACE_DURATION.restaurant, 'minutes');
        }

        // Add ALL remaining restaurants and attractions
        const remainingPlaces = [
          ...breakfastPlaces,
          ...lunchPlaces,
          ...dinnerPlaces,
          ...uncategorizedRestaurants,
          ...dayAttractions
        ];

        console.log('📍 Remaining places to schedule:', remainingPlaces.length);

        for (const place of remainingPlaces) {
          if (place.category === 'dining' || place.category === 'restaurant') {
            const mealType = getMealType(place);
            let visitTime;
            
            switch(mealType) {
              case 'breakfast':
                visitTime = '10:30';
                break;
              case 'lunch':
                visitTime = '13:30';
                break;
              case 'dinner':
                visitTime = '19:30';
                break;
              default:
                // For uncategorized restaurants, space them out through the day
                if (currentTime.hour() < 11) visitTime = '10:30';
                else if (currentTime.hour() < 15) visitTime = '14:00';
                else visitTime = '19:30';
            }

            dayPlaces.push({
              ...place,
              visitTime,
              duration: PLACE_DURATION.restaurant,
              mealType: mealType || 'flexible'
            });
          } else {
            // For remaining attractions, add them at the current time
            dayPlaces.push({
              ...place,
              visitTime: currentTime.format('HH:mm'),
              duration: PLACE_DURATION.attraction
            });
            currentTime.add(PLACE_DURATION.attraction, 'minutes');
          }
        }

        // Sort all places by visit time
        dayPlaces.sort((a, b) => 
          moment(a.visitTime, 'HH:mm').diff(moment(b.visitTime, 'HH:mm'))
        );

        console.log('\n📝 Final schedule for the day:', 
          dayPlaces.map(p => `${p.visitTime} - ${p.name} (${p.category}${p.mealType ? ' - ' + p.mealType : ''})`)
        );

        // Verify all places are used
        console.log('✅ Total places scheduled:', dayPlaces.length);
        console.log('📋 Original places to schedule:', placesToSchedule.length);

        generatedItinerary.days.push({
          day: dayIndex + 1,
          date: currentDate.format('DD MMM YYYY'),
          places: dayPlaces
        });
      }

      // After the loop, if there are still unused places, distribute them across days
      if (unusedPlaces.length > 0) {
        console.log(`⚠️ Distributing ${unusedPlaces.length} remaining places`);
        unusedPlaces.forEach((place, index) => {
          const dayIndex = index % totalDays;
          generatedItinerary.days[dayIndex].places.push({
            ...place,
            visitTime: '16:00', // Default to late afternoon
            duration: PLACE_DURATION[place.category] || PLACE_DURATION.attraction
          });
        });
      }

      console.log('\n💾 Saving itinerary to Firestore...');
      // Save to Firestore
      if (docId) {
        const nearestHotels = await findNearestHotels(lat,long);
        console.log('Hotel recommendation:', nearestHotels);
        console.log('📝 Updating existing document:', docId);
        const docRef = doc(firestore, 'userItinerary', docId);
        await updateDoc(docRef, {
          itineraryData: generatedItinerary,
          cart: JSON.stringify(cart),
          hotelRecommendation: nearestHotels
        });
        router.push({
          pathname: '(tabs)/(itinerary)/(create-itinerary)/review-itinerary',
          params: { docId: docId },
        });
      } else {
        const nearestHotels = await findNearestHotels(itineraryData?.locationInfo?.coordinates.lat, itineraryData?.locationInfo?.coordinates.lng);
        const newDocId = Date.now().toString();
        console.log('📝 Creating new document:', newDocId);
        await setDoc(doc(firestore, 'userItinerary', newDocId), {
          docId: newDocId,
          userEmail: user?.email,
          cart: JSON.stringify(cart),
          info: itineraryData?.locationInfo,
          tripDetails: {
            budget: itineraryData?.budget,
            totalDays: itineraryData?.totalNoOfDays,
            totalNights: itineraryData?.totalNoOfDays-1,
            traveler: itineraryData?.traveler,
            tripName: itineraryData?.tripName,
            destination: itineraryData?.locationInfo?.name,
          },
          hotelRecommendation: nearestHotels,
          itineraryData: generatedItinerary,
          startDate: moment(itineraryData?.startDate).format('DD MMM YYYY'),
          endDate: moment(itineraryData?.endDate).format('DD MMM YYYY')
        });
        router.push({
          pathname: '(tabs)/(itinerary)/(create-itinerary)/review-itinerary',
          params: { docId: newDocId },
        });
      }
      
      console.log('✨ Itinerary generation completed successfully!');
      clearCart();

    } catch (error) {
      console.error('❌ Error generating itinerary:', error);
      Alert.alert('Error', 'Failed to generate itinerary');
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