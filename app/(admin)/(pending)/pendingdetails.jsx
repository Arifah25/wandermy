import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Image, ScrollView, TouchableOpacity, Modal, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { DetailTab, Poster, Button} from '../../../components';
import { icons } from '../../../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDatabase, ref, refValue, set, remove, get,update, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const PendingDetails = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [event, setEvent] = useState({});
  const [hour, setOperatingHours] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pendingPlaces, setPendingPlaces] = useState([]); // To store the pending places
  const route = useRoute();
  const router = useRouter();
  const { placeID, name, address, websiteLink, category, poster, contactNum, tags, description, feeAmount, admissionType, status } = route.params;
  const auth = getAuth();
  const db = getDatabase();
  const orderedDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const [placeData, setPlaceData] = useState({
    price_or_menu: [],
  });

  // Handle pressing a place card to navigate to its details, passing all place data
  const handleAddToListing = (placeID) => {
    // Reference the place in the database using its ID
    const placeRef = ref(db, `places/${placeID}`);

    const localDate = new Date();
    // Adjust the time to UTC+5 by adding 5 hours to the local time
    localDate.setHours(localDate.getHours() + 8);  
    // Convert the adjusted time to ISO format
    const currentDate = localDate.toISOString(); // ISO format in UTC+5  
    // Update the status from "pending" to "approved"
    update(placeRef, {
      status: 'approved',
      dateApproved: currentDate, // Add the current date as dateApproved
    })
      .then(() => {
        console.log(`Place with ID ${placeID} has been approved.`);
      })
      .catch((error) => {
        console.error('Error updating status:', error);
      });
      router.back();
  };

  const rejectPlace = (placeID, category) => {
    const placeRef = ref(db, `places/${placeID}`);
  
    const localDate = new Date();
    localDate.setHours(localDate.getHours() + 8); // Adjust to UTC+8
    const currentDate = localDate.toISOString(); // ISO format
  
    // Update the status to rejected
    update(placeRef, {
      status: "rejected",
      dateRejected: currentDate,
    })
      .then(() => {
        console.log(`Place with ID ${placeID} has been rejected.`);
        router.back(); // Navigate back after action
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };
  

  const handleReject = () => {
    toggleModalVisibility();
  };

  const toggleModalVisibility = () => {
    setIsModalVisible(!isModalVisible);
  };

  const deletePlace = (placeID, category) => {
    const db = getDatabase();
  
    // Construct the path to the place using the category and placeID
    const placeRef = ref(db, `places/${placeID}`);
  
    // Perform the deletion
    remove(placeRef)
      .then(() => {
        console.log(`Place with ID ${placeID} in category ${category} deleted successfully.`);
      })
      .catch((error) => {
        console.error("Error deleting place:", error);
      });
  };

  useEffect(() => {
    if (placeID) {
      const userRef = ref(db, `places/${placeID}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("Fetched data:", data); 
          setPlaceData(data);
          // console.log("Poster Images:", data.poster); // Log poster images          // console.log("Price Images:", data.price_or_menu); // Log price images
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });
    }
  }, [placeID]);

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

    if (category === 'event' && status == 'pending') fetchEvent();
  }, [placeID, category]);

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

  // if (loading || bookmarkLoading) {
  //   return <ActivityIndicator size="large" color="#A91D1D" />;
  // }

  return (
    <View className="h-full items-center">
      <ScrollView className=" w-full">
        <View className="m-5">
        {category === 'event' ? (
          <Image
            source={{ uri: poster }}
            className="w-full h-auto rounded-lg bg-secondary"
            style={{ aspectRatio: 1 }}
          />
        ) : (
          <Poster image={poster} />
        )}
          <Text className="mt-4 ml-3 font-kbold text-3xl">{name}</Text>

          {category !== 'event' && (
            <DetailTab activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

          {/* dah masuk detail place */}
          <View>
            {activeTab === 'details' ? renderDetails() : null}
            <View className="flex-row items-center justify-evenly mt-5 mb-10">
              <Button 
              title="Reject"
              handlePress={handleReject}
              style="bg-primary w-2/5"
              textColor="text-white"/>        

              <Button 
              title="Approve"
              handlePress={() => handleAddToListing(placeID, category)}
              style="bg-primary w-2/5"
              textColor="text-white"/>
            </View>
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View className=" flex-1 justify-center items-center blur-xl">
          <View className="border bg-secondary w-[295px] h-[250px] p-[20px] rounded-[8px]">
            <TouchableOpacity 
              onPress={toggleModalVisibility}
              className=" absolute top-6 right-6"
            >
              <Image source={icons.close} className="w-5 h-5 align-top"/>
            </TouchableOpacity> 
            <Text className="mt-9 font-kregular text-2xl text-center">
              Reject addition of this place?
            </Text>
            <View className="flex-row items-center justify-evenly mt-5 mb-10">
              <Button 
              title="No"
              handlePress={toggleModalVisibility}
              style="bg-primary w-2/5"
              textColor="text-white"/>        

              <Button 
              title="Yes"
              handlePress={() => deletePlace(placeID, category)}
              style="bg-primary w-2/5"
              textColor="text-white"/>
            </View>
          </View>
        </View>
      </Modal> 
    </View>
  );
};

export default PendingDetails;
