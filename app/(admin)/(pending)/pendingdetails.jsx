import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Image, ScrollView, TouchableOpacity, Modal, Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { DetailTab, Poster, Button } from '../../../components';
import { icons } from '../../../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDatabase, ref, set, remove, get, update, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const PendingDetails = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [event, setEvent] = useState({});
  const [operatingHours, setOperatingHours] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [placeData, setPlaceData] = useState({
    price_or_menu: [],
  });

  const route = useRoute();
  const router = useRouter();
  const db = getDatabase();
  const auth = getAuth();

  const { placeID, name, address, websiteLink, category, poster, contactNum, tags, description, feeAmount, admissionType, status } = route.params;
  const orderedDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const fetchPlaceDetails = async () => {
    if (placeID) {
      const userRef = ref(db, `places/${placeID}`);
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setPlaceData(snapshot.val());
        } else {
          console.error('No data available');
        }
      } catch (error) {
        console.error('Error fetching place details:', error);
      }
    }
  };

  const fetchOperatingHours = () => {
    const hourRef = ref(db, `operatingHours/${placeID}`);
    onValue(hourRef, (snapshot) => {
      const data = snapshot.val();
      const sortedHours = orderedDays.map((day) =>
        data && data[day]
          ? { dayOfWeek: day, ...data[day] }
          : { dayOfWeek: day, isOpen: false, openingTime: null, closingTime: null }
      );
      setOperatingHours(sortedHours);
    });
  };

  const fetchEventDetails = async () => {
    if (category === 'event' && status === 'pending') {
      const eventRef = ref(db, `event/${placeID}`);
      try {
        const snapshot = await get(eventRef);
        if (snapshot.exists()) {
          setEvent(snapshot.val());
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    }
  };

  useEffect(() => {
    fetchPlaceDetails();
    fetchOperatingHours();
    fetchEventDetails();
  }, [placeID]);

  // const handleAddToListing = async () => {
  //   const placeRef = ref(db, `places/${placeID}`);
  //   const currentDate = new Date(new Date().setHours(new Date().getHours() + 8)).toISOString();

  //   try {
  //     await update(placeRef, { status: 'approved', dateApproved: currentDate });
  //     console.log(`Place with ID ${placeID} has been approved.`);
  //     router.back();
  //   } catch (error) {
  //     console.error('Error approving place:', error);
  //   }
  // };

  const handleAddToListing = async () => {
    const placeRef = ref(db, `places/${placeID}`);
    const currentDate = new Date(new Date().setHours(new Date().getHours() + 8)).toISOString();
  
    try {
      // Fetch the place details to get the user ID
      const placeSnapshot = await get(placeRef);
      if (!placeSnapshot.exists()) {
        console.error('Place does not exist.');
        return;
      }
  
      const placeData = placeSnapshot.val();
      const userId = placeData.user;
  
      if (!userId) {
        console.error('No user ID associated with this place.');
        return;
      }
  
      // Approve the place
      await update(placeRef, { status: 'approved', dateApproved: currentDate });
      console.log(`Place with ID ${placeID} has been approved.`);
  
      // Fetch the user's current points
      const userRef = ref(db, `users/${userId}`);
      const userSnapshot = await get(userRef);
      if (!userSnapshot.exists()) {
        console.error('User does not exist.');
        return;
      }
  
      const userData = userSnapshot.val();
      const currentPoints = userData.points || 0;
  
      // Increment the user's points by 15
      const newPoints = currentPoints + 15;
      await update(userRef, { points: newPoints });
  
      console.log(`User with ID ${userId} has been rewarded with 15 points. New total: ${newPoints}`);
  
      router.back(); // Navigate back after approval
    } catch (error) {
      console.error('Error approving place and rewarding user:', error);
    }
  };
  

  const rejectPlace = async () => {
    const placeRef = ref(db, `places/${placeID}`);
    const currentDate = new Date(new Date().setHours(new Date().getHours() + 8)).toISOString();

    try {
      await update(placeRef, { status: 'rejected', dateRejected: currentDate });
      console.log(`Place with ID ${placeID} has been rejected.`);
      router.back();
    } catch (error) {
      console.error('Error rejecting place:', error);
    }
  };

  const toggleModalVisibility = () => {
    setIsModalVisible(!isModalVisible);
  };

  const renderOperatingHours = () => (
    <View className="w-full items-start mt-3">
      <Text className="text-lg font-ksemibold">Operating Hours :</Text>
      {operatingHours.map((hour, index) => (
        <View key={index} className="flex-row">
          <Text className="w-1/3 font-kregular">{hour.dayOfWeek}</Text>
          {hour.isOpen ? (
            <Text className="w-2/3 font-kregular text-right">
              {hour.openingTime} - {hour.closingTime}
            </Text>
          ) : (
            <Text className="text-right w-[30%] font-kregular">Closed</Text>
          )}
        </View>
      ))}
    </View>
  );

// Render details
  const renderDetails = () => (
    <View className="mx-2 ">
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
      
      <View className="items-center mx-7 justify-center">
        {category === 'event'? (
          <View className="w-full items-start mt-3">
            <View >
              <Text className="text-lg font-ksemibold">Description :</Text>
              <Text className="font-kregular">{description}</Text>
            </View>

            <View className="w-full items-start mt-3">
              <Text className="text-lg font-ksemibold">Event date & time :</Text>
              <Text className="font-kregular">
                {event.startDate} - {event.endDate}{"\n"}{event.startTime} - {event.endTime}
              </Text>
            </View>

            <View className="w-full items-start">
              <Text className="text-lg font-ksemibold">Contact Number :</Text>
              <Text className="font-kregular">{contactNum}</Text>
            </View>

            <View className="w-full items-start mt-3">
              <Text className="text-lg font-ksemibold">Admission Fee:</Text>
              {admissionType === 'free' ? (
                <Text className="font-kregular mt-2">Free Entry</Text>
              ) : (
                <Text className="font-kregular mt-2">{feeAmount}</Text>
              )}
            </View>
            {placeData.price_or_menu && placeData.price_or_menu.length > 0 ? (
              <View className="w-full items-start mt-3">
                <Text className="text-lg font-ksemibold mb-3">More Details :</Text>
                <View className="w-full">
                  {placeData.price_or_menu.map((imageUri, index) => (
                    <Image
                    key={index}
                    source={{ uri: imageUri }}
                    style={{
                      width: '100%', // Make it occupy full width
                      aspectRatio: 1, // Maintain a 1:1 aspect ratio (square images)
                      marginBottom: 10, // Add spacing between images
                    }}
                    resizeMode="contain"
                  />
                  ))}
                </View>
              </View>
            ) : null}
            <View className="w-full items-start my-3">
              <Text className="text-lg font-ksemibold">Tags :</Text>
              <Text className=" font-kregular">{tags}</Text>
            </View>
          </View>   
                 
        ):category === 'attraction' ? (
          <View className="w-full items-start mt-3">

            <View className="w-full items-start">
              <Text className="text-lg font-ksemibold">Address :</Text>
              <Text className="font-kregular">{address}</Text>
            </View>

            <View className="w-full items-start mt-3">
              <Text className="text-lg font-ksemibold">Operating Hours :</Text>
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

            <View className="w-full items-start">
              <Text className="text-lg font-ksemibold">Contact Number :</Text>
              <Text className="font-kregular">{contactNum}</Text>
            </View>

            <View className="w-full items-start mt-3">
              <Text className="text-lg font-ksemibold">Admission Fee:</Text>
              {admissionType === 'free' ? (
                <Text className="font-kregular mt-2">Free Entry</Text>
              ) : placeData.price_or_menu && placeData.price_or_menu.length > 0 ? (
                <View className="w-full">
                  {placeData.price_or_menu.map((imageUri, index) => (
                    <Image
                    key={index}
                    source={{ uri: imageUri }}
                    style={{
                      width: '100%', // Make it occupy full width
                      aspectRatio: 1, // Maintain a 1:1 aspect ratio (square images)
                      marginBottom: 10, // Add spacing between images
                    }}
                    resizeMode="contain"
                  />
                  ))}
                </View>
              ) : (
                <Text className="font-kregular mt-2">No price information available.</Text>
              )}
            </View>
            <View className="w-full items-start my-3">
              <Text className="text-lg font-ksemibold">Tags :</Text>
              <Text className=" font-kregular">{tags}</Text>
            </View>
          </View>

        ) : category === 'dining' ? (
          <View className="w-full items-start mt-3">

            <View className="w-full items-start">
              <Text className="text-lg font-ksemibold">Address :</Text>
              <Text className="font-kregular">{address}</Text>
            </View>

            <View className="w-full items-start mt-3">
              <Text className="text-lg font-ksemibold">Operating Hours :</Text>
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

            <View className="w-full items-start">
              <Text className="text-lg font-ksemibold">Contact Number :</Text>
              <Text className="font-kregular">{contactNum}</Text>
            </View>

            <Text className="text-lg font-ksemibold">Menu :</Text>
            {placeData.price_or_menu && placeData.price_or_menu.length > 0 ? (
              <View className="w-full">
                {placeData.price_or_menu.map((imageUri, index) => (
                  <Image
                  key={index}
                  source={{ uri: imageUri }}
                  style={{
                    width: '100%', // Make it occupy full width
                    aspectRatio: 1, // Maintain a 1:1 aspect ratio (square images)
                    marginBottom: 10, // Add spacing between images
                  }}
                  resizeMode="contain"
                />
                ))}
              </View>
            ) : (
              <Text className="font-kregular mt-2">No menu available.</Text>
            )}

            <View className="w-full items-start my-3">
              <Text className="text-lg font-ksemibold">Tags :</Text>
              <Text className="font-kregular">{tags}</Text>
            </View>
          </View>
        ) : null}      
      </View>
    </View>
  );
  return (
    <View className="h-full items-center">
      <ScrollView className="w-full">
        <View className="m-5">
          <Poster image={poster} />
          <Text className="mt-4 ml-3 font-kbold text-3xl">{name}</Text>

          {category !== 'event' && (
            <DetailTab activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

          {activeTab === 'details' && renderDetails()}

          <View className="flex-row items-center justify-evenly mt-5 mb-10">
            <Button title="Reject" handlePress={toggleModalVisibility} style="bg-primary w-2/5" textColor="text-white" />
            <Button title="Approve" handlePress={handleAddToListing} style="bg-primary w-2/5" textColor="text-white" />
          </View>
        </View>
      </ScrollView>

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center">
          <View className="border bg-secondary w-[295px] h-[250px] p-[20px] rounded-[8px]">
            <TouchableOpacity onPress={toggleModalVisibility} className="absolute top-6 right-6">
              <Image source={icons.close} className="w-5 h-5" />
            </TouchableOpacity>
            <Text className="mt-9 font-kregular text-2xl text-center">Reject addition of this place?</Text>
            <View className="flex-row items-center justify-evenly mt-5 mb-10">
              <Button title="No" handlePress={toggleModalVisibility} style="bg-primary w-2/5" textColor="text-white" />
              <Button title="Yes" handlePress={rejectPlace} style="bg-primary w-2/5" textColor="text-white" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PendingDetails;

