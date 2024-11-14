import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Image, ScrollView, TouchableOpacity, Modal, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { DetailTab, Poster, Button} from '../../../components';
import { images, icons } from '../../../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDatabase, ref, onValue, set, remove, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const DetailsH = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [event, setEvent] = useState({});
  const [reviews, setReviews] = useState([]);
  //const [bookmark, setBookmark] = useState(false);
  const [userProfiles, setUserProfiles] = useState({});
  const [hour, setOperatingHours] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const router = useRouter();
  const route = useRoute();
  const navigation = useNavigation();
  
  const { placeID, name, address, websiteLink, category, poster, contactNum, tags, price_or_menu, description,status } = route.params;
  const auth = getAuth();
  const db = getDatabase();
  const userId = auth.currentUser?.uid;
  const orderedDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Handle pressing a place card to navigate to its details, passing all place data
  const handleEditPress = (placeID, category) => {
    if (category === 'dining') {
      router.push({
        pathname: '(admin)/(home)/(edit)/editdining',
        params: {placeID}, // Pass all the place data as route params
      });
    } else if (category === 'attraction') {
      router.push({
        pathname: '(admin)/(home)/(edit)/editattraction',
        params: {placeID}, // Pass all the place data as route params
      });
    } else if (category === 'event') {
      router.push({
        pathname: '(admin)/(home)/(edit)/editevent',
        params: {placeID}, // Pass all the place data as route params
      });
    }
    console.log('Route params:', route.params);
    console.log('PlaceID:', placeID);
    
  };

  const handleDelete = () => {
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

    
    if (category === 'event' && status == 'approved') fetchEvent();
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
    status === 'approved' ? (
      <View style={{ marginTop: 5, marginHorizontal: 20 }}>
        {category !== 'event' && websiteLink && (
          <View style={{ marginBottom: 12, borderRadius: 8, backgroundColor: '#f0f0f0' }}>
            <TouchableOpacity
              onPress={() => Linking.openURL(websiteLink)}
              style={{ height: 36, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 16, fontFamily: 'KRegular' }}>Website</Text>
            </TouchableOpacity>
          </View>
        )}
  
        <View style={{ alignItems: 'center', marginHorizontal: 40, justifyContent: 'center' }}>
          <View style={{ width: '100%', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 18, fontFamily: 'KSemibold' }}>Address :</Text>
            <Text style={{ fontFamily: 'KRegular' }}>{address || 'N/A'}</Text>
          </View>
  
          {category === 'event' ? (
            <View style={{ width: '100%', alignItems: 'flex-start', marginTop: 12 }}>
              <Text style={{ fontSize: 18, fontFamily: 'KSemibold' }}>Event date & time :</Text>
              <Text style={{ fontFamily: 'KRegular' }}>
                {event?.startDate} - {event?.endDate}{"\n"}{event?.startTime} - {event?.endTime}
              </Text>
            </View>
          ) : (
            <View style={{ width: '100%', alignItems: 'flex-start', marginTop: 12 }}>
              <Text style={{ fontSize: 18, fontFamily: 'KSemibold' }}>Operating Hours :</Text>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                <View key={index} style={{ flexDirection: 'row' }}>
                  <Text style={{ width: '33%', fontFamily: 'KRegular' }}>{day}</Text>
                  {hour[index]?.isOpen ? (
                    <Text style={{ width: '66%', fontFamily: 'KRegular', textAlign: 'right' }}>
                      {hour[index].openingTime} - {hour[index].closingTime}
                    </Text>
                  ) : (
                    <Text style={{ textAlign: 'right', width: '30%', fontFamily: 'KRegular' }}>Closed</Text>
                  )}
                </View>
              ))}
            </View>
          )}
  
          <View style={{ width: '100%', alignItems: 'flex-start', marginTop: 12 }}>
            <Text style={{ fontSize: 18, fontFamily: 'KSemibold' }}>Contact Number :</Text>
            <Text style={{ fontFamily: 'KRegular' }}>{contactNum || 'N/A'}</Text>
          </View>
  
          {category === 'event' ? (
            <View>
              <View style={{ width: '100%', alignItems: 'flex-start', marginTop: 12 }}>
                <Text style={{ fontSize: 18, fontFamily: 'KSemibold' }}>Description :</Text>
                <Text style={{ fontFamily: 'KRegular' }}>{description || 'No description available'}</Text>
              </View>
              <View style={{ width: '100%', alignItems: 'flex-start', marginTop: 12 }}>
                <Text style={{ fontSize: 18, fontFamily: 'KSemibold' }}>Ticket Fee :</Text>
                {price_or_menu ? (
                  <Image 
                    source={{ uri: price_or_menu }} 
                    style={{ width: 256, height: 208 }}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={{ fontFamily: 'KRegular' }}>No ticket information available</Text>
                )}
              </View>
              <View style={{ width: '100%', alignItems: 'flex-start', marginVertical: 12 }}>
                <Text style={{ fontSize: 18, fontFamily: 'KSemibold' }}>Tags :</Text>
                <Text style={{ fontFamily: 'KRegular' }}>{tags || 'No tags available'}</Text>
              </View>
            </View>   
          ) : (
            <View style={{ width: '100%', alignItems: 'flex-start', marginTop: 12 }}>
              {category === 'attraction' ? (
                <Text style={{ fontSize: 18, fontFamily: 'KSemibold' }}>Price :</Text>
              ) : (
                <Text style={{ fontSize: 18, fontFamily: 'KSemibold' }}>Menu :</Text>
              )}
              {price_or_menu ? (
                <Image 
                  source={{ uri: price_or_menu }} 
                  style={{ width: 256, height: 208 }}
                  resizeMode="contain"
                />
              ) : (
                <Text style={{ fontFamily: 'KRegular' }}>No menu/price available</Text>
              )}
              <View style={{ width: '100%', alignItems: 'flex-start', marginVertical: 12 }}>
                <Text style={{ fontSize: 18, fontFamily: 'KSemibold' }}>Tags :</Text>
                <Text style={{ fontFamily: 'KRegular' }}>{tags || 'No tags available'}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    ) : null
  );

  // Render reviews (currently empty)
  const renderReview = () => (
    <View className="h-full mx-5 ">
      {reviews.length === 0 ? (
        <Text>No reviews available</Text>
      ) : (
        reviews.map((review, index) => {
          const userProfile = userProfiles[reviews[index].user] || {};
          return (
            <View key={index} 
            className="items-start mb-3"
            >
              <View className="flex-row items-center">
                <Image source={{ uri: userProfile.profilePicture}} className="w-12 h-12 rounded-full" />
                <View className="ml-3 justify-start p-3">
                  <Text>{userProfile.username}</Text>
                  <Text>{new Date(review.datePosted).toLocaleDateString()}</Text>
                </View>
              </View>
              <View className="flex-row justify-start center mt-1 ">
                {[...Array(5)].map((_, i) => (
                  <Image
                    key={i}
                    source={icons.star}
                    className={`w-[30px] h-[35px] mx-2`}
                    resizeMode='cover'
                    tintColor={i < review.rating ? "#FFB655" : "gray"}
                  />
                ))}
              </View>
              <View className="w-full mt-5 flex-row justify-start">
                {review.photo && review.photo.map((photo, index) => (
                  <Image key={index} source={{ uri: photo }} className="w-32 h-36 " resizeMode='contain' />
                ))}
              </View>
              <View className="mt-5 w-5/6">
                <Text className="font-kregular text-sm">
                  {review.comment}
                </Text>
              </View>
              <View className="mt-5">
                <Text className="font-bold text-sm">Visited on:</Text>
                <Text className="p-2 bg-secondary mt-1 uppercase font-kbold text-justify">
                  {review.choiceQuestion }
                </Text>
              </View>
              <View className="w-full border-b-0.5 border-[#808080] mt-5">
                
              </View>
            </View>
          );
        })
      )}
       
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

          <View>
            {activeTab === 'details' ? renderDetails() : null}
            <View className="flex-row items-center justify-evenly mt-5 mb-10">
              <Button 
              title="Delete"
              handlePress={handleDelete}
              style="bg-primary w-2/5"
              textColor="text-white"/>        

              <Button 
              title="Edit"
              handlePress={() => handleEditPress(placeID, category)}
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
              Delete the place from the database?
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

export default DetailsH;
