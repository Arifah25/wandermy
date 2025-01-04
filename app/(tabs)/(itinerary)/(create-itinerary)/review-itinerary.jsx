import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../../../configs/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../../../constants';
import { useRouter } from 'expo-router';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';

const ReviewItinerary = () => {
  const [itineraryData, setItineraryData] = useState(null);
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placeDetails, setPlaceDetails] = useState({});
  const router = useRouter();
  const route = useRoute();
  const { docId } = route.params;

  useEffect(() => {
    const fetchItinerary = async () => {
      setLoading(true);
      try {
        // Reference the Firestore document by its ID
        const docRef = doc(firestore, 'userItinerary', docId);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const data = docSnap.data();
          setItineraryData(data.itineraryData || []); // Default to empty array if data is missing
          setDate(data);
          console.log('Document Data:', data);
        } else {
          console.log(`Document with ID ${docId} does not exist.`);
        }
      } catch (error) {
        console.error('Error fetching itinerary:', error);
      } finally {
        setLoading(false);
      }
    };
  
    if (docId) {
      fetchItinerary();
    }
  }, [docId, firestore]);
  

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      const db = getDatabase();
      const newPlaceDetails = {};

      if (itineraryData) {
        Object.keys(itineraryData.itinerary).forEach((day) => {
          itineraryData.itinerary[day].forEach((item) => {
            const placeRef = ref(db, `places/${item.placeID}`);
            onValue(placeRef, (snapshot) => {
              const details = snapshot.val();
              newPlaceDetails[item.placeID] = details;
              setPlaceDetails((prevDetails) => ({ ...prevDetails, [item.placeID]: details }));
            });
          });
        });
      }
    };

    fetchPlaceDetails();
  }, [itineraryData]);

  const renderTransportRecommendation = useMemo(() => {
    if (!itineraryData) return null;
    return (
      <View>
        <Text className="text-lg font-kregular mt-3">🚌 Transport Recommendation:</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {itineraryData.publicTransport.map((item, index) => (
            <View key={index} className="border border-secondary p-2 mx-2 rounded-lg mt-2" style={{ width: 200 }}>
              <Text className="font-ksemibold">{item.mode}</Text>
              <Text className="font-kregular">{item.route}</Text>
              <Text className="font-kregular">Operator: {item.operator}</Text>
              <Text className="font-kregular mb-6">Price: {item.estimatedPrice.min} - {item.estimatedPrice.max}</Text>
              {/* <View className="absolute right-2 bottom-2">
                <TouchableOpacity>
                  <Text className="font-kregular text-blue-500">Book Now</Text>
                </TouchableOpacity>
              </View> */}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }, [itineraryData]);

  const renderHotelRecommendation = useMemo(() => {
    if (!itineraryData) return null;
    return (
      <View>
        <Text className="text-lg font-kregular mt-3">🏨 Hotel Recommendation:</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {itineraryData.accommodation.map((item, index) => (
            <View key={index} className="mx-3 border border-secondary rounded-lg mt-2" style={{ width: 200 }}>
              {/* <View className="items-center bg-secondary rounded-lg">
                <Image source={icons.wandermy} style={{ width: 100, height: 100 }} />
              </View> */}
              <View className="rounded-lg p-2 mt-2">
                <Text className="font-ksemibold">{item.name}</Text>
                <Text className="font-kregular">{item.location}</Text>
                <Text className="font-kregular">{item.priceRange.min} - {item.priceRange.max}</Text>
                <Text className="font-kregular text-right">⭐ {item.rating}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }, [itineraryData]);

  const renderItinerary = useMemo(() => {
    if (!itineraryData) return null;
    return (
      <View>
        <Text className="text-lg font-kregular mt-3">📑 Itinerary</Text>
        {Object.keys(itineraryData.itinerary).map((day, index) => (
          <View key={index}>
            <Text className="text-lg font-kregular mb-2">Day {index + 1}:</Text>
            {itineraryData.itinerary[day].map((item, itemIndex) => (
              <View key={itemIndex} className="rounded-lg border mb-5 p-2 items-center"
              // onPress={() => handlePlacePress(placeDetails[item.placeID])}
              >
              <View className="items-start flex-row w-full">
                <View className="mr-2 rounded-lg items-center w-1/2 h-32">
                  {placeDetails[item.placeID]?.poster ? (
                    <Image source={{ uri: placeDetails[item.placeID].poster[0] }}
                      resizeMode='cover'
                      className="rounded-lg w-full h-full"
                    />
                  ) : (
                    <Image source={icons.wandermy} style={{ width: 100, height: 100 }} />
                  )}
                </View>
                <View className="w-[45%] items-start ml-2 ">
                  <Text className="font-kregular text-lg">{item.place}</Text>
                  <Text className="font-kregular text-sm">⏱️ {item.time}</Text>
                  <Text className="font-kregular text-sm">💸 {item.budget}</Text>
                </View>
              </View>
            </View>
            ))}
          </View>
        ))}
      </View>
    );
  }, [itineraryData, placeDetails]);

  const navigateDetails = (docId) => {
    router.replace({
      pathname: '(tabs)/(itinerary)/detailsiti',
      params: { docId },
    });
  };

  const navigateEdit = (docId) => {
    router.push({
      pathname: '(tabs)/(itinerary)/(create-itinerary)/choose-places',
      params: { docId, cartD: date.cart, info: date.info },
    });
    console.log(date.info);
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  if (!itineraryData) {
    return <Text>No Itinerary Data</Text>;
  }

  return (
    <SafeAreaView className="bg-white h-full flex-1  ">
      <View className="flex-row items-center mx-6 justify-between">
        <TouchableOpacity onPress={() => navigateEdit(date.docId)} style={{ marginTop: 5 }}>
          <AntDesign name="edit" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateDetails(date.docId)} style={{ marginTop: 10 }}>
        <Ionicons name="checkmark-done-circle" size={40} color="green" />
        </TouchableOpacity>
      </View>
      <View className='px-5 justify-start h-full'>
      <View className="gap-x-4 p-2 ">
        <Text className="text-2xl font-ksemibold">{itineraryData.tripDetails.tripName}</Text>
        <Text className="text-base font-kregular">📍 {itineraryData.tripDetails.destination}</Text>
        <Text className="text-base font-kregular">📅 {date.startDate} - {date.endDate} ({itineraryData.tripDetails.totalDays} days {itineraryData.tripDetails.totalNights} nights)</Text>
        <View className="flex-row justify-between">
          <Text className="text-base font-kregular">💵 {itineraryData.tripDetails.budget} </Text>
          <Text className="text-base font-kregular">🧍🏽‍♂️ {itineraryData.tripDetails.traveler} </Text>
        </View>
      </View>
      
      <ScrollView>
        {renderTransportRecommendation}
        {renderHotelRecommendation}
        {renderItinerary}
        <View className="flex-row justify-evenly mt-5">
          {/* <TouchableOpacity
            onPress={() => navigateEdit(date.docId)}
            className="bg-primary h-10 rounded-md items-center justify-center w-1/3"
          >
            <Text className="text-white font-kregular text-sm">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateDetails(date.docId)}
            className="bg-primary h-10 rounded-md items-center justify-center w-1/3"
          >
            <Text className="text-white font-kregular text-sm">Done</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ReviewItinerary;