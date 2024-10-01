import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { DetailTab, Poster } from '../../../components';
import { images, icons } from '../../../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDatabase, ref, onValue, set, remove, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';


const Details = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [data, setData] = useState({});
    const [reviews, setReviews] = useState([]);
    const [bookmark, setBookmark] = useState(false);
    const [userProfiles, setUserProfiles] = useState({});
    const router = useRouter();
    const route = useRoute();
    const navigation = useNavigation();
    const {placeID, name, latitude, longitude, address, websiteLink, contactNum, poster, price_or_menu, operatingHours, tags } = route.params;

    const auth = getAuth();
    const db = getDatabase();
    const userId = auth.currentUser?.uid;

    useEffect(() => {
      const fetchUserProfiles = async (reviewList) => {
        const profiles = {};
        for (const review of reviewList) {
          if (!profiles[review.userId]) {
            const userRef = ref(db, `users/${review.userId}`);
            const snapshot = await get(userRef);
            profiles[review.userId] = snapshot.val();
          }
        }
        setUserProfiles(profiles);
      };
    
      const refToUse = ref(db, `reviews/${placeID}`);
      const unsubscribe = onValue(refToUse, (snapshot) => {
        const data = snapshot.val();
        const reviewList = data ? Object.values(data) : [];
        setReviews(reviewList);

        fetchUserProfiles(reviewList);
        setLoading(false);
      });
      
      return () => unsubscribe();
    }, [placeID]);

    useEffect(() => {
      setLoading(true);
      const refToUse = ref(db, `places/${placeID}`);
      const unsubscribe = onValue(refToUse, (snapshot) => {
        const data = snapshot.val();
        setData(data || {});
        setLoading(false);
      });
      return () => unsubscribe();
    }, [placeID]);

    useEffect(() => {
        const checkBookmarkStatus = async () => {
          if (!userId) return;
          const bookmarkRef = ref(db, `bookmarks/${userId}/${placeID}`);
          const snapshot = await get(bookmarkRef);
          setBookmark(snapshot.exists());
        };
        checkBookmarkStatus();
      }, [userId, placeID]);

      const handleBookmarkPress = async () => {
        if (!userId) return;
        const bookmarkRef = ref(db, `bookmarks/${userId}/${attractionId}`);
        if (bookmark) {
          await remove(bookmarkRef);
        } else {
          await set(bookmarkRef, {
            bookmarkId: `${userId}_${placeID}`,
            userId,
            placeID,
            dateBookmarked: new Date().toISOString(),
          });
        }
        setBookmark(!bookmark);
      };
    
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
      }, [router, bookmark]);

      const handleAddReview = () => {
        console.log("noi");
        router.push({
          pathname: '(tabs)/(explore)/addreview',
          params: { placeID }, // Pass all the place data as route params
        });
      };
    
      const renderDetails = () => (
        <ScrollView className="px-5">
          <View className="flex-1">
            <Text className="font-kbold text-base">Address:</Text>
            <View><Text>{address || 'No Address Available'}</Text></View>
          </View>
          <View className="flex-1 mt-3">
            <Text className="font-kbold text-base">Operating Hours:</Text>
            <View><Text>{operatingHours || 'No Hours Available'}</Text></View>
          </View>
          <View className="flex-1 mt-3">
            <Text className="font-kbold text-base">Contact Number:</Text>
            <View><Text>{contactNum || 'No Contact Number Available'}</Text></View>
          </View>
          <View className="flex-1 mt-3">
            <Text className="font-kbold text-base">Price:</Text>
            <View className="items-center">
              <Image source={price_or_menu || images.logo} className="w-60 h-40" />
            </View>
          </View>
          <View className="flex-1 mt-3 mb-10">
            <Text className="font-kbold text-base">Tags:</Text>
            <View><Text>{tags || 'No Tags Available'}</Text></View>
          </View>
        </ScrollView>
      );
    
      const renderReview = () => (
        <Text>
          hello
        </Text>
      );
    
      if (loading) {
        return <ActivityIndicator size="large" color="#A91D1D" />;
      }
    
      
      return (
        <View className="flex-1 items-center mt-5">
          <View className="">
            <Poster uri={poster} />
            <Text className="mt-3 font-kregular text-xl">{name || "Testing name"}</Text>
            <DetailTab activeTab={activeTab} setActiveTab={setActiveTab} />
            <View className="">
              {activeTab === 'details' ? renderDetails() : renderReview()}
            </View>
            
          </View>
        </View>
      );
    }
    
export default Details