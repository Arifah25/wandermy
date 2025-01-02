import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { firestore } from '../../../../configs/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../../../constants';
import { useRouter } from 'expo-router';
import { getDatabase, ref, onValue } from 'firebase/database';

const ReviewItinerary = () => {
  const [itineraryData, setItineraryData] = useState(null);
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placeDetails, setPlaceDetails] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchLatestItinerary = async () => {
      setLoading(true);
      try {
        const q = query(collection(firestore, 'userItinerary'), orderBy('docId', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          setItineraryData(doc.data().itineraryData);
          setDate(doc.data());
        });
      } catch (error) {
        console.error('Error fetching latest itinerary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestItinerary();
  }, []);

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
              <View className="absolute right-2 bottom-2">
                <TouchableOpacity>
                  <Text className="font-kregular text-blue-500">Book Now</Text>
                </TouchableOpacity>
              </View>
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
              <View className="items-center bg-secondary rounded-lg">
                <Image source={icons.wandermy} style={{ width: 100, height: 100 }} />
              </View>
              <View className="rounded-lg p-2 mt-2">
                <Text className="font-kregular">{item.name}</Text>
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
              <TouchableOpacity key={itemIndex} className="rounded-lg border mb-5 p-2 items-center"
              onPress={() => handlePlacePress(placeDetails[item.placeID])}>
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
            </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  }, [itineraryData, placeDetails]);

  const navigateDetails = (docId) => {
    router.push({
      pathname: '(tabs)/(itinerary)/detailsiti',
      params: { docId },
    });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  if (!itineraryData) {
    return <Text>No Itinerary Data</Text>;
  }

  return (
    <SafeAreaView className="bg-white h-full flex-1 p-5 justify-start">
      <View className="gap-x-4 p-2">
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
          <TouchableOpacity
            onPress={() => router.push('(tabs)/(itinerary)/(create-itinerary)/choose-places')}
            className="bg-primary h-10 rounded-md items-center justify-center w-1/3"
          >
            <Text className="text-white font-kregular text-sm">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateDetails(date.docId)}
            className="bg-primary h-10 rounded-md items-center justify-center w-1/3"
          >
            <Text className="text-white font-kregular text-sm">Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReviewItinerary;