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
  const [userProfiles, setUserProfiles] = useState({});
  const [hour, setOperatingHours] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pendingPlaces, setPendingPlaces] = useState([]); // To store the pending places
  const route = useRoute();
  const router = useRouter();

  
  const { placeID, name, address, websiteLink, category, poster, contactNum, tags, price_or_menu, description, status } = route.params;
  const auth = getAuth();
  const db = getDatabase();
  const orderedDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Handle pressing a place card to navigate to its details, passing all place data
  const handleAddToListing = (placeID) => {
    // Reference the place in the database using its ID
    const placeRef = ref(db, `places/${placeID}`);
  
    // Update the status from "pending" to "approved"
    update(placeRef, {
      status: 'approved',
    })
      .then(() => {
        console.log(`Place with ID ${placeID} has been approved.`);
      })
      .catch((error) => {
        console.error('Error updating status:', error);
      });
      router.back();
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
    const fetchPendingPlaces = async () => {
      const placesRef = ref(db, `places/${placeID}`);
      onValue(placesRef, (snapshot) => {
        const data = snapshot.val();
        const pendingPlaces = Object.values(data).filter(place => place.status === 'pending');
        setPendingPlaces(pendingPlaces);
      });
    };
  
    fetchPendingPlaces();
  }, []);
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

  // Fetch reviews and user profiles
useEffect(() => {
  const fetchReviewsAndProfiles = async () => {
    const refToUse = ref(db, `reviews/${placeID}`);
    onValue(refToUse, (snapshot) => {
      const data = snapshot.val();
      const reviewList = data ? Object.values(data) : [];
      setReviews(reviewList);  // Set the fetched reviews in state

      // Now fetch user profiles for each review
      const fetchUserProfiles = async (reviewList) => {
        const profiles = {};  // Store fetched profiles here
        for (const review of reviewList) {
          const userId = review.user;  // Use review.user to get the userId
          if (!profiles[userId]) {     // Check if this user's profile has not been fetched yet
            const userRef = ref(db, `users/${userId}`);  // Correct path to user data
            const userSnapshot = await get(userRef);     // Fetch user data from Firebase
            profiles[userId] = userSnapshot.val();       // Store the fetched profile data
          }
        }
        setUserProfiles(profiles);  // Set the user profiles in state
      };

      fetchUserProfiles(reviewList);  // Fetch profiles after getting the reviews
      setLoading(false);
    });
  };

  fetchReviewsAndProfiles();
}, [placeID]);  // Dependency on placeID

  // Render details
  const renderDetails = () => (
    <View className="mt-1 mx-5 ">
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
          <Text className="text-lg font-ksemibold">Address :</Text>
          <Text className="font-kregular">{address}</Text>
        </View>

        {category === 'event' ? (
          <View className="w-full items-start mt-3">
            <Text className="text-lg font-ksemibold">Event date & time :</Text>
            <Text className="font-kregular">
              {event.startDate} - {event.endDate}{"\n"}{event.startTime} - {event.endTime}
            </Text>
          </View>
        ) : (
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
        )}         

        <View className="w-full items-start mt-3">
          <Text className="text-lg font-ksemibold">Contact Number :</Text>
          <Text className="font-kregular">{contactNum}</Text>
        </View>

        {category === 'event'? (
          <View>
            <View className="w-full items-start mt-3">
              <Text className="text-lg font-ksemibold">Description :</Text>
              <Text className="font-kregular">{description}</Text>
            </View>
            <View className="w-full items-start mt-3">
              <Text className="text-lg font-ksemibold">Ticket Fee :</Text>
              <View classname="w-full">
                <Image 
                source={{uri:price_or_menu}}
                className="w-64 h-52"
                resizeMode='contain'
                />
                </View>
            </View>
            <View className="w-full items-start my-3">
              <Text className="text-lg font-ksemibold">Tags :</Text>
              <Text className=" font-kregular">{tags}</Text>
            </View>
          </View>   
                 
        ):(
        <View className="w-full items-start mt-3">
          {category === 'attraction' ? (
            <Text className="text-lg font-ksemibold">Price :</Text>
          ):(
            <Text className="text-lg font-ksemibold">Menu :</Text>
          )}
          <View className="w-full">
            <Image 
            source={{uri:price_or_menu}}
            className="w-64 h-52"
            resizeMode='contain'
            />
          </View>
          <View className="w-full items-start my-3">
            <Text className="text-lg font-ksemibold">Tags :</Text>
            <Text className=" font-kregular">{tags}</Text>
          </View>
        </View>
        )}        
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
          <Poster image={poster} />
          <Text className="mt-3 ml-3 font-kregular text-xl">{name}</Text>

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
