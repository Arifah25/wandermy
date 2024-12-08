import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import { useRoute } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { collection, doc, getDoc } from 'firebase/firestore'
import { firestore } from '../../../configs/firebaseConfig'
import { icons } from '../../../constants'
import { Button } from '../../../components'
import { useRouter } from 'expo-router'
import Feather from '@expo/vector-icons/Feather';

const ItineraryDetails = () => {
  const route = useRoute();
  const { docId } = route.params;
  const [itineraryData, setItineraryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchItinerary = async () => {
      setLoading(true);
      try {
        const docRef = doc(collection(firestore, 'userItinerary'), docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setItineraryData(docSnap.data().itineraryData);
          setDate(docSnap.data());
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching itinerary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [docId]);

  const renderTransportRecommendation = useMemo(() => {
    if (!itineraryData) return null;
    return (
      <View>
        <Text className="text-lg font-kregular mt-3">🚌 Transport Recommendation:</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {itineraryData.publicTransport.map((item, index) => (
            <View key={index} className="border border-secondary p-2 mx-2 rounded-lg mt-2">
              <Text className="font-kregular">{item.mode}</Text>
              <Text className="font-kregular">{item.route}</Text>
              <Text className="font-kregular">Operator: {item.operator}</Text>
              <Text className="font-kregular">Price: {item.estimatedPrice.min} - {item.estimatedPrice.max}</Text>
              <View className="items-end">
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
            <View key={index} className="mx-3 border border-secondary rounded-lg mt-2">
              <View className="items-center bg-secondary rounded-lg ">
                <Image source={icons.wandermy} style={{ width: 100, height: 100 }} />
              </View>
              <View className=" rounded-lg p-2 mt-2">
                <Text className="font-kregular">{item.name}</Text>
                <Text className="font-kregular">{item.location}</Text>
                <Text className="font-kregular">{item.priceRange.min} - {item.priceRange.max}</Text>
                <Text className="font-kregular text-right ">⭐ {item.rating}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }, [itineraryData]);

  const renderItinerary = useMemo(() => {
    if (!itineraryData) return null;
  
    // Sort the days to ensure they are in the correct order
    const sortedDays = Object.keys(itineraryData.itinerary).sort((a, b) => {
      const dayA = parseInt(a.replace('day', ''), 10);
      const dayB = parseInt(b.replace('day', ''), 10);
      return dayA - dayB;
    });
  
    return (
      <View>
        <Text className="text-lg font-kregular mt-3">📑 Itinerary</Text>
        {sortedDays.map((day, index) => (
          <View key={index}>
            <Text className="text-lg font-kregular mb-2">Day {index + 1}:</Text>
            {itineraryData.itinerary[day].map((item, index) => (
              <View key={index} className="rounded-lg border mb-5 p-2 flex-row items-center">
                <View className="mx-3">
                  <Image source={icons.wandermy} style={{ width: 100, height: 100 }} />
                </View>
                <View className="w-3/5">
                  <Text className="font-kregular text-lg">{item.place}</Text>
                  <Text className="font-kregular text-sm">{item.activities}</Text>
                  <Text className="font-kregular text-sm">{item.time}</Text>
                  <Text className="font-kregular text-sm">💸 {item.budget} per person</Text>
                  <Text className="font-kregular text-sm text-right">⏱️ {item.hoursToSpend} hours</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }, [itineraryData]);

  if (loading) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  if (!itineraryData) {
    return <Text>No Itinerary Data</Text>;
  }

  const handleBack = () => {
    router.back();
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center mx-6 justify-between">
        <TouchableOpacity onPress={handleBack} style={{  marginTop: 5 }}>
          <Image source={icons.left} style={{ width: 24, height: 24, tintColor: '#000' }} />
        </TouchableOpacity>
        <TouchableOpacity  style={{  marginTop: 5 }}>
          <Feather name="share" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View className=" px-5 w-full ">
      <View className="gap-x-4 p-2">
        <Text className="text-2xl font-ksemibold">{itineraryData.tripDetails.tripName}</Text>
        <Text className="text-base font-kregular">📍 {itineraryData.tripDetails.destination}</Text>
        <Text className="text-base font-kregular">📅 {date.startDate} - {date.endDate} ({itineraryData.tripDetails.totalDays} days {itineraryData.tripDetails.totalNights} nights)</Text>
        <View className="flex-row justify-between">
          <Text className="text-base font-kregular">💵 {itineraryData.tripDetails.budget} </Text>
          <Text className="text-base font-kregular">🧍🏽‍♂️ {itineraryData.tripDetails.traveler} </Text>
        </View>
      </View>
      <ScrollView className="mb-7 flex h-4/5">
        {renderTransportRecommendation}
        {renderHotelRecommendation}
        {renderItinerary}
       <Text></Text>
      </ScrollView>
      
      </View>
    </SafeAreaView>
  );
};

export default ItineraryDetails