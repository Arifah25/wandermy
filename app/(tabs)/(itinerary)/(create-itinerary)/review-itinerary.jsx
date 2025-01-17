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
          // console.log('Document Data:', data);
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
      // console.log("Fetching Itinerary Data:", itineraryData);
      
      if (itineraryData?.days) {
        const newPlaceDetails = {};
        
        itineraryData.days.forEach((day) => {
          day.places.forEach((item) => {
            const placeRef = ref(db, `places/${item.placeID}`);
            onValue(placeRef, (snapshot) => {
              const details = snapshot.val();
              if (details) {
                newPlaceDetails[item.placeID] = details;
                setPlaceDetails((prevDetails) => ({ ...prevDetails, [item.placeID]: details }));
              }
            });
          });
        });
        console.log("Updated Place Details:", newPlaceDetails);
      }
    };
    
    fetchPlaceDetails();
  }, [itineraryData]);

  const renderTransportRecommendation = useMemo(() => {
    // Since we don't have transport data in new structure, return null or placeholder
    return null;
    // Or show placeholder:
    // return (
    //   <View>
    //     <Text className="text-lg font-kregular mt-3">🚌 Transport options will be added soon</Text>
    //   </View>
    // );
  }, [itineraryData]);

  const renderHotelRecommendation = useMemo(() => {
    if (!itineraryData) return null;
    return (
      <View>
        <Text className="text-lg font-kregular mt-3">🏨 Hotel Recommendation:</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {date.hotelRecommendation.map((item, index) => (
            <View key={index} className="mx-3 border border-secondary rounded-lg mt-2" style={{ width: 200 }}>
              {/* <View className="items-center bg-secondary rounded-lg">
                <Image source={icons.wandermy} style={{ width: 100, height: 100 }} />
              </View> */}
              <View className="rounded-lg p-2 mt-2">
                <Text className="font-ksemibold">{item.name}</Text>
                <Text className="font-kregular">{item.address}</Text>
                {/* <Text className="font-kregular">{item.priceRange.min} - {item.priceRange.max}</Text> */}
                <Text className="font-kregular text-right">⭐ {item.rating}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }, [itineraryData]);

  const renderItinerary = useMemo(() => {
    if (!itineraryData?.days) return null;
    return (
      <View>
        <Text className="text-lg font-kregular mt-3">📑 Itinerary</Text>
        {itineraryData.days.map((day, index) => (
          <View key={index}>
            <Text className="text-lg font-kregular mb-2">Day {day.day}:</Text>
            {day.places.map((item, itemIndex) => (
              <View key={itemIndex} className="rounded-lg border mb-5 p-2 items-center">
                <View className="items-start flex-row w-full">
                  <View className="mr-2 rounded-lg items-center w-1/2 h-32">
                    {placeDetails[item.placeID]?.poster ? (
                      <Image 
                        source={{ uri: placeDetails[item.placeID].poster[0] }}
                        resizeMode='cover'
                        className="rounded-lg w-full h-full"
                      />
                    ) : (
                      <Image source={icons.wandermy} style={{ width: 100, height: 100 }} />
                    )}
                  </View>
                  <View className="w-[45%] items-start ml-2 ">
                    <Text className="font-kregular text-lg">{item.name}</Text>
                    <Text className="font-kregular text-sm">⏱️ {item.visitTime || 'Flexible'}</Text>
                    <Text className="font-kregular text-sm">⏳ {item.duration ? `${item.duration} mins` : 'Flexible'}</Text>
                    <Text className="font-kregular text-sm">📍 {item.category}</Text>
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
      params: { docId, cartD: date.cart, destination: date.tripDetails.destination, lat: date.info.coordinates.lat, long: date.info.coordinates.lng, startDate: date.startDate, endDate: date.endDate, info: date, days: date.tripDetails.totalDays },
    });
    // console.log(date.info);
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  if (!itineraryData) {
    return <Text>No Itinerary Data</Text>;
  }

  return (
    <SafeAreaView className="bg-white h-full flex-1 pb-10">
      <View className="flex-row items-center mx-6 justify-between ">
        <TouchableOpacity onPress={() => navigateEdit(date.docId)} style={{ marginTop: 5 }}>
          <AntDesign name="edit" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateDetails(date.docId)} style={{ marginTop: 10 }}>
        <Ionicons name="checkmark-done-circle" size={40} color="green" />
        </TouchableOpacity>
      </View>
      <View className='px-5 justify-start h-full'>
      <View className="gap-x-4 p-2">
        <Text className="text-2xl font-ksemibold">{date.tripDetails.tripName}</Text>
        <Text className="text-base font-kregular">📍 {date.tripDetails.destination}</Text>
        <Text className="text-base font-kregular">📅 {date.startDate} - {date.endDate} ({date.tripDetails.totalDays} days {date.tripDetails.totalNights} nights)</Text>
        <View className="flex-row justify-between">
          <Text className="text-base font-kregular">💵 {date.tripDetails.budget} </Text>
          <Text className="text-base font-kregular">🧍🏽‍♂️ {date.tripDetails.traveler} </Text>
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