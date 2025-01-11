import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { DetailTab, Poster } from '../../../components';
import { images, icons } from '../../../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDatabase, ref, onValue, set, remove, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import FastImage from 'react-native-fast-image';

const Details = () => {
  const router = useRouter();
  const route = useRoute();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [event, setEvent] = useState({});
  const [reviews, setReviews] = useState([]);
  const [bookmark, setBookmark] = useState(false);
  const [userProfiles, setUserProfiles] = useState({});
  const [hour, setOperatingHours] = useState([]);
  const [placeData, setPlaceData] = useState({
    price_or_menu: [],
  });
  
  const { placeID, name, address, websiteLink, category, poster, contactNum, tags, description, feeAmount, admissionType, status } = route.params;
  const auth = getAuth();
  const db = getDatabase();
  const userId = auth.currentUser?.uid;
  const orderedDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  //fetch data from db
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

  // Fetch remaining event details
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


  // Fetch bookmark status
  const [bookmarkLoading, setBookmarkLoading] = useState(true);

useEffect(() => {
  const checkBookmarkStatus = async () => {
    setBookmarkLoading(true);
    if (!userId || !placeID) return;
    const bookmarkRef = ref(db, `bookmark/${userId}/${placeID}`);
    const snapshot = await get(bookmarkRef);
    setBookmark(snapshot.exists());
    setBookmarkLoading(false);
  };

  checkBookmarkStatus();
}, [userId, placeID]);

  // Handle bookmark press
  const handleBookmarkPress = async () => {
    if (!userId) return;
    const bookmarkRef = ref(db, `bookmark/${userId}/${placeID}`);
    if (bookmark) {
      await remove(bookmarkRef);
    } else {
      await set(bookmarkRef, { 
        placeID: placeID, // Include the placeID
        dateBookmarked: new Date().toISOString() 
      });
    }
    setBookmark(!bookmark);
  };

  // Navigation header for bookmark
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleBookmarkPress} style={{ marginRight: 10 }}>
          <Image
            source={bookmark ? icons.bookmarked : icons.bookmark}
            style={{ width: 24, height: 24, tintColor: 'white' }}
          />
        </TouchableOpacity>
      ),
    });
  }, [bookmark]);

  // Handle review add
  const handleAddReview = () => {
    router.push({
      pathname: '(tabs)/(explore)/addreview',
      params: { placeID, name },
    });
  };

  useEffect(() => {
    console.log("Details Page Data:", route.params);
  }, []);
  
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

  if (loading || bookmarkLoading) {
    return <ActivityIndicator size="large" color="#A91D1D" />;
  }

  return (
    <View className="h-full items-center">
      <ScrollView className=" w-full">
      <View className="m-5">
        {category === 'event' ? (
          <Image
          source={{
            uri: poster,
            cache: 'force-cache', // Options: 'default', 'reload', 'force-cache', 'only-if-cached'
          }}
          style={{
            width: '100%',
            aspectRatio: 1,
            borderRadius: 10,
            backgroundColor: '#E5E5E5', // Optional fallback background
          }}
          resizeMode="contain"
        />
          // <Image
          //   source={{ uri: poster }}
          //   className="w-full h-auto rounded-lg bg-secondary"
          //   style={{ aspectRatio: 1 }}
          // />
        ) : (
          <Poster image={poster} />
        )}
          <Text className="mt-4 ml-3 font-kbold text-3xl">{name}</Text>

          {category !== 'event' && (
            <DetailTab activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

          <View>
            {activeTab === 'details' ? renderDetails() : renderReview()}
          </View>
       </View>
      </ScrollView>
      {activeTab === 'reviews' && (
        <TouchableOpacity
          onPress={handleAddReview}
          className="absolute bottom-5 right-5 bg-primary h-10 rounded-md items-center justify-center w-1/3"
        >
          <Text className="text-white font-kregular text-sm">Add Review</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Details;