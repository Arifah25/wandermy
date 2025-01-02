import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../../constants';
import { Poster, Header } from '../../../components';

const DetailsPlaces = () => {
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState({});
  const [hour, setOperatingHours] = useState([]);
  const route = useRoute();

  const { placeID, name, address, websiteLink, category, poster, contactNum, tags, price_or_menu, description, latitude, longitude } = route.params;
  const db = getDatabase();
  const orderedDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Fetch operating hours
  useEffect(() => {
    const hourRef = ref(db, `operatingHours/${placeID}`);
  
    onValue(hourRef, (snapshot) => {
      const data = snapshot.val();

      // Initialize an empty array to hold the sorted hours
      const sortedHours = [];

      // Iterate over the orderedDays array and pick the corresponding data from the snapshot
      orderedDays.forEach((day) => {
        if (data && data[day]) {
          sortedHours.push({
            dayOfWeek: day,
            ...data[day],
          });
        } else {
          sortedHours.push({
            dayOfWeek: day,
            isOpen: false,
            openingTime: null,
            closingTime: null,
          });
        }
      });

      setOperatingHours(sortedHours); // Now the operating hours are in the correct order
    });
  }, [placeID]);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const eventRef = ref(db, `event/${placeID}`);
      const snapshot = await get(eventRef);
      const eventData = snapshot.exists() ? snapshot.val() : {};
      setEvent(eventData);
      setLoading(false);
    };

    if (category === 'event') fetchEvent();
  }, [placeID, category]);

  // Render details
  const renderDetails = () => (
    <View className="mt-1 mx-5 mb-10">
      {category !== 'event' && (
        <View className="mb-3 rounded-md bg-secondary">
          <TouchableOpacity
            onPress={() => Linking.openURL(websiteLink)}
            className="h-9 items-center justify-center"
          >
            <Text className="text-base font-kregular">Website</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View className="items-center mx-10 justify-center">
        <View className="w-full items-start">
          <Text className="text-lg font-ksemibold">Address:</Text>
          <Text className="font-kregular">{address}</Text>
        </View>

        {category === 'event' ? (
          <View className="w-full items-start mt-3">
            <Text className="text-lg font-ksemibold">Event date & time:</Text>
            <Text className="font-kregular">
              {event.startDate} - {event.endDate}{"\n"}{event.startTime} - {event.endTime}
            </Text>
          </View>
        ) : (
          <View className="w-full items-start mt-3">
            <Text className="text-lg font-ksemibold">Operating Hours:</Text>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
              <View key={index} className="flex-row">
                <Text className="w-1/3 font-kregular">{day}</Text>
                {hour[index]?.isOpen ? (
                  <Text className="w-2/3 font-kregular text-right">
                    {hour[index].openingTime} - {hour[index].closingTime}
                  </Text>
                ) : (
                  <Text className="text-right w-[30%] font-kregular">Closed</Text>
                )}
              </View>
            ))}
          </View>
        )}         

        <View className="w-full items-start mt-3">
          <Text className="text-lg font-ksemibold">Contact Number:</Text>
          <Text className="font-kregular">{contactNum}</Text>
        </View>

        {category === 'event'? (
          <View>
            <View className="w-full items-start mt-3">
              <Text className="text-lg font-ksemibold">Ticket Fee:</Text>
              <View classname="w-full">
                <Image 
                source={{uri:price_or_menu}}
                className="w-64 h-52"
                resizeMode='contain'
                />
                </View>
            </View>
            <View className="w-full items-start mt-3">
              <Text className="text-lg font-ksemibold">Description:</Text>
              <Text className="font-kregular">{description}</Text>
            </View>
            <View className="w-full items-start my-3">
              <Text className="text-lg font-ksemibold">Tags:</Text>
              <Text className=" font-kregular">{tags}</Text>
            </View>
          </View>   
                 
        ):( 
        <View className="w-full items-start mt-3">
          {category === 'attraction' ? (
            <Text className="text-lg font-ksemibold">Price:</Text>
          ):( 
            <Text className="text-lg font-ksemibold">Menu:</Text>
          )}
          <View className="w-full">
            <Image 
            source={{uri:price_or_menu}}
            className="w-64 h-52"
            resizeMode='contain'
            />
          </View>
          <View className="w-full items-start my-3">
            <Text className="text-lg font-ksemibold">Tags:</Text>
            <Text className=" font-kregular">{tags}</Text>
          </View>
        </View>
        )}        
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />
      <ScrollView className=" w-full">
       <View className="m-5">
        <Poster image={poster} />
          <Text className="mt-3 ml-3 font-kregular text-xl">{name}</Text>

          <View>
            {renderDetails()}
        </View>

          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailsPlaces;