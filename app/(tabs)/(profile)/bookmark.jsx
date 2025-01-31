import { View, Text, SafeAreaView, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, PlaceCard } from "../../../components";
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const BookmarkPlaces = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState([]); // Store bookmark IDs
  const router = useRouter();
  const auth = getAuth();
  const db = getDatabase();
  const userId = auth.currentUser?.uid;

  // Function to fetch bookmark data
  const fetchBookmarks = async () => {
    if (!userId) {
      console.log('User not logged in');
      setLoading(false);
      return;
    }

    try {
      // Reference to user's bookmarks
      const bookmarksRef = ref(db, `bookmark/${userId}`);
      const snapshot = await get(bookmarksRef);
      const bookmarks = snapshot.val() || {};

      // Debug logging to see the fetched bookmarks
      console.log('Bookmarks fetched:', bookmarks);

      const bookmarkIds = Object.keys(bookmarks); // Get all bookmarked place IDs

      if (bookmarkIds.length === 0) {
        // No bookmarks
        setPlaces([]);
        setLoading(false);
        return;
      }

      setBookmarkIds(bookmarkIds); // Store the IDs in the state

      // Fetch place details for each bookmarked place
      const placesPromises = bookmarkIds.map(async (placeID) => {
        const placeRef = ref(db, `places/${placeID}`);
        const placeSnapshot = await get(placeRef);
        const placeData = placeSnapshot.val();

        // Ensure place data exists to avoid null/undefined issues
        if (placeData) {
          return { id: placeID, ...placeData };
        }
        return null; // Handle the case where place data doesn't exist
      });

      const placesData = await Promise.all(placesPromises);
      const validPlaces = placesData.filter((place) => place !== null); // Filter out any null places

      setPlaces(validPlaces); // Set the actual places data
    } catch (error) {
      console.error('Error fetching bookmarks or places:', error);
    } finally {
      setLoading(false); // Ensure loading is set to false in all cases
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handlePress = (item) => {
    router.push({
      pathname: '(tabs)/(profile)/details',
      params: { ...item }, // Pass all the place data as route params
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookmarks();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-white flex-1 justify-center items-center p-[20px]">
        <ActivityIndicator size="large" color="#A91D1D" />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 p-5 justify-start bg-white">
      <FlatList
        data={places}
        renderItem={({ item }) => (
          <PlaceCard 
            image={item.poster ? item.poster[0] : null} 
            name={item.name} 
            handlePress={() => handlePress(item)} 
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginHorizontal: 16, marginTop: 10 }}
        ListEmptyComponent={() => (
          <View className="justify-center items-center mt-7">
            <Text className="font-kbold text-xl">No Bookmark Found</Text>
            <Text className="font-kregular text-md">
              No Bookmark available at the moment
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/(explore)')} // Navigate to the explore page
              style={{
                marginTop: 15,
                backgroundColor: '#A91D1D',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
              }}
            >
              <Text className="font-ksemibold text-white text-lg">Explore</Text>
            </TouchableOpacity>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default BookmarkPlaces;
