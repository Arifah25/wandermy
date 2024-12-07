import { View, Text, Image, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { firestore } from '../../../../configs/firebaseConfig'

const ReviewItinerary = () => {
  const [itineraryData, setItineraryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestItinerary = async () => {
      setLoading(true);
      try {
        const q = query(collection(firestore, 'userItinerary'), orderBy('docId', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          setItineraryData(doc.data().itineraryData);
        });
      } catch (error) {
        console.error('Error fetching latest itinerary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestItinerary();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  if (!itineraryData) {
    return <Text>No Itinerary Data</Text>;
  }

  return (
    <ScrollView>
      <View>
        <Text>Accommodations:</Text>
        {itineraryData.accommodation.map((item, index) => (
          <View key={index}>
            <Image source={{ uri: item.imageUrl }} style={{ width: 100, height: 100 }} />
            <Text>{item.name}</Text>
            <Text>{item.location}</Text>
            <Text>{item.priceRange.min} - {item.priceRange.max}</Text>
            <Text>Rating: {item.rating}</Text>
          </View>
        ))}
      </View>

      <View>
        <Text>Itinerary Day 1:</Text>
        {itineraryData.itinerary.day1.map((item, index) => (
          <View key={index}>
            <Text>{item.place}</Text>
            <Text>{item.activities}</Text>
            <Text>{item.time}</Text>
            <Text>Budget: {item.budget}</Text>
            <Text>Hours to Spend: {item.hoursToSpend}</Text>
          </View>
        ))}
      </View>

      <View>
        <Text>Itinerary Day 2:</Text>
        {itineraryData.itinerary.day2.map((item, index) => (
          <View key={index}>
            <Text>{item.place}</Text>
            <Text>{item.activities}</Text>
            <Text>{item.time}</Text>
            <Text>Budget: {item.budget}</Text>
            <Text>Hours to Spend: {item.hoursToSpend}</Text>
          </View>
        ))}
      </View>

      <View>
        <Text>Public Transport:</Text>
        {itineraryData.publicTransport.map((item, index) => (
          <View key={index}>
            <Text>{item.mode}</Text>
            <Text>{item.route}</Text>
            <Text>Operator: {item.operator}</Text>
            <Text>Price: {item.estimatedPrice.min} - {item.estimatedPrice.max}</Text>
            <Text>Booking Link: {item.bookingLink}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

export default ReviewItinerary