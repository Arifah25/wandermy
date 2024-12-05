import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Poster, HeaderWithCart } from '../../../../components';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { CreateItineraryContext } from '../../../../context/CreateItineraryContext';
import { CartContext } from '../../../../context/CartContext';

const DetailsPlaces = () => {
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState({});
  const [hour, setOperatingHours] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  const router = useRouter();
  const route = useRoute();
  const { itineraryData, setItineraryData } = useContext(CreateItineraryContext);
  const { cart, addToCart, removeFromCart } = useContext(CartContext);
  
  const { placeID, name, address, websiteLink, category, poster, contactNum, tags, price_or_menu, description } = route.params;
  const auth = getAuth();
  const db = getDatabase();
  const orderedDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const handleAddToCart = () => {
    addToCart({ placeID, name, address, websiteLink, category, poster, contactNum, tags, price_or_menu, description });
  };

  const handleRemoveFromCart = (placeID) => {
    removeFromCart(placeID);
  }

  const handleGenerateItinerary = () => {
    // Implement the logic to generate the itinerary
    console.log('Generating itinerary with:', cart);
    setItineraryData({...itineraryData, 
      places: cart
    });
    // router.push('(tabs)/(itinerary)/');
  }

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
    return <ActivityIndicator size="large" color="#A91D1D" />;
  }

  return (
    <View className="flex-1 bg-white">
      <HeaderWithCart onCartPress={() => setModalVisible(true)} />
      <ScrollView className=" w-full">
       <View className="m-5">
        <Poster image={poster} />
          <Text className="mt-3 ml-3 font-kregular text-xl">{name}</Text>

          <View>
            {renderDetails()}
          </View>

          
       </View>
      </ScrollView>
      <TouchableOpacity
        onPress={handleAddToCart}
        className="absolute bottom-5 right-5 bg-primary h-10 rounded-md items-center justify-center w-1/3"
      >
        <Text className="text-white font-kregular text-sm">Add to Itinerary</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white p-5 rounded-t-lg">
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
            <TouchableOpacity
              onPress={handleGenerateItinerary}
              className="bg-primary h-10 rounded-md items-center justify-center mt-5"
            >
              <Text className="text-white font-kregular text-sm">Generate Itinerary</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="absolute top-2 right-2"
            >
              <Text className="text-lg font-kbold">X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DetailsPlaces;