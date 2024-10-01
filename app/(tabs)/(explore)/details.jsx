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
  const [bookmark, setBookmark] = useState(false);
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
        setReviews(reviewList);
        
        const fetchUserProfiles = async (reviewList) => {
          const profiles = {};
          for (const review of reviewList) {
            if (!profiles[review.userId]) {
              const userRef = ref(db, `users/${review.userId}`);
              const userSnapshot = await get(userRef);
              profiles[review.userId] = userSnapshot.val();
            }
          }
          setUserProfiles(profiles);
        };

        fetchUserProfiles(reviewList);
        setLoading(false);
      });
    };

    fetchReviewsAndProfiles();
  }, [placeID]);

  // Fetch bookmark status
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!userId) return;
      const bookmarkRef = ref(db, `bookmarks/${userId}/${placeID}`);
      const snapshot = await get(bookmarkRef);
      setBookmark(snapshot.exists());
    };
    
    checkBookmarkStatus();
  }, [userId, placeID]);

  // Handle bookmark press
  const handleBookmarkPress = async () => {
    console.log(price_or_menu);
    if (!userId) return;
    const bookmarkRef = ref(db, `bookmark/${userId}/${placeID}`);
    if (bookmark) {
      await remove(bookmarkRef);
    } else {
      await set(bookmarkRef, { dateBookmarked: new Date().toISOString() });
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
      params: { placeID },
    });
  };

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
                  <Text className="text-right w-[34%] font-kregular">Closed</Text>
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
              <Image 
              source={{uri:price_or_menu}}
              className="w-64 h-52"
              resizeMode='contain'
              />
            </View>
            <View className="w-full items-start mt-3">
              <Text className="text-lg font-ksemibold">Description:</Text>
              <Text className="font-kregular">{description}</Text>
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
        </View>
        )}
        <View className="w-full items-start my-3">
          <Text className="text-lg font-ksemibold">Tags:</Text>
          <Text className="font-kregular">{tags}</Text>
        </View>
      </View>
    </View>
  );

  // Render reviews (currently empty)
  const renderReview = () => (
    <View>
      {/* Add review components here */}
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#A91D1D" />;
  }

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
          </View>
       </View>
      </ScrollView>
    </View>
  );
};

export default Details;
