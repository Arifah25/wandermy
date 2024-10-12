import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { DetailTab, Poster } from '../../../components';
import { images, icons } from '../../../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDatabase, ref, onValue, set, remove, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const Details = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [event, setEvent] = useState({});
  const [reviews, setReviews] = useState([]);
  //const [bookmark, setBookmark] = useState(false);
  const [userProfiles, setUserProfiles] = useState({});
  const [hour, setOperatingHours] = useState([]);
  
  const router = useRouter();
  const route = useRoute();
  const navigation = useNavigation();
  
  const { placeID, name, address, websiteLink, category, poster, contactNum, tags, price_or_menu, description } = route.params;
  const auth = getAuth();
  const db = getDatabase();
  const userId = auth.currentUser?.uid;
  const orderedDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Handle pressing a place card to navigate to its details, passing all place data
<<<<<<< Updated upstream
  const handleEditPress = (placeID, category) => {
    // console.log('Navigating to:', placeID, category); // Log the place details
    router.push({
      pathname: '(admin)/(home)/edit',
      params: {placeID, category}, // Pass all the place data as route params
=======
  const handleEditPress = (placeID) => {
    console.log('Navigating to:', place); // Log the place details
    router.push({
      pathname: '(admin)/(home)/edit',
      params: {placeID}, // Pass all the place data as route params
>>>>>>> Stashed changes
    });
  };

  const toggleModalVisibility = () => {
    setIsModalVisible(!isModalVisible);
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

    if (category === 'event') fetchEvent();
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
  // const [bookmarkLoading, setBookmarkLoading] = useState(true);

// useEffect(() => {
//   const checkBookmarkStatus = async () => {
//     setBookmarkLoading(true);
//     if (!userId || !placeID) return;
//     const bookmarkRef = ref(db, `bookmark/${userId}/${placeID}`);
//     const snapshot = await get(bookmarkRef);
//     setBookmark(snapshot.exists());
//     setBookmarkLoading(false);
//   };

//   checkBookmarkStatus();
// }, [userId, placeID]);

//   // Handle bookmark press
//   const handleBookmarkPress = async () => {
//     // console.log(price_or_menu);
//     if (!userId) return;
//     const bookmarkRef = ref(db, `bookmark/${userId}/${placeID}`);
//     if (bookmark) {
//       await remove(bookmarkRef);
//     } else {
//       await set(bookmarkRef, { dateBookmarked: new Date().toISOString() });
//     }
//     setBookmark(!bookmark);
//   };

//   // Navigation header for bookmark
//   useEffect(() => {
//     navigation.setOptions({
//       headerRight: () => (
//         <TouchableOpacity onPress={handleBookmarkPress} style={{ marginRight: 10 }}>
//           <Image
//             source={bookmark ? icons.bookmarked : icons.bookmark}
//             style={{ width: 24, height: 24, tintColor: 'white' }}
//           />
//         </TouchableOpacity>
//       ),
//     });
//   }, [bookmark]);

//  // Handle review add
//   const handleAddReview = () => {
//     router.push({
//       pathname: '(tabs)/(explore)/addreview',
//       params: { placeID, name },
//     });
//   };
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

  // Render reviews (currently empty)
  

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
            {activeTab === 'details' ? renderDetails() : renderReview()}
            <TouchableOpacity
<<<<<<< Updated upstream
              onPress={() => handleEditPress(placeID, category)}
=======
              onPress={() => handleEditPress(placeID)}
>>>>>>> Stashed changes
              style={{
                padding: 15,
                borderBottomWidth: 1,
                borderBottomColor: '#ccc',
              }} // Styling for list items
              
              className="border-t-[0.5px] border-gray-300" // Updated border size and color
            >
              <Text 
                className="font-kregular text-xl my-4 text-center"
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>
       </View>
      </ScrollView>
      {/* {activeTab === 'reviews' && (
        <TouchableOpacity
          onPress={handleAddReview}
          className="absolute bottom-5 right-5 bg-primary h-10 rounded-md items-center justify-center w-1/3"
        >
          <Text className="text-white font-kregular text-sm">Add Review</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );
};

export default Details;
