import { View, Text, SafeAreaView, FlatList, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { PlacesBox } from "../../../components";
import { getDatabase, ref, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const BookmarkPlaces = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBookmarks = async () => {
      const auth = getAuth();
      const db = getDatabase();
      const userId = auth.currentUser?.uid;

      if (!userId) {
        setLoading(false);
        return;
      }

      const bookmarksRef = ref(db, `bookmarks/${userId}`);
      onValue(bookmarksRef, async (snapshot) => {
        const bookmarks = snapshot.val() || {};
        const bookmarkIds = Object.keys(bookmarks);

        if (bookmarkIds.length === 0) {
          setPlaces([]);
          setLoading(false);
          return;
        }

        const placesPromises = bookmarkIds.map(async (id) => {
          const placeRef = ref(db, `places/${id}`);
          const placeSnapshot = await new Promise((resolve) => {
            onValue(placeRef, (snap) => {
              resolve(snap);
            }, { onlyOnce: true });
          });
          return placeSnapshot.val();
        });

        const placesData = await Promise.all(placesPromises);
        setPlaces(placesData);
        setLoading(false);
      });
    };

    fetchBookmarks();
  }, []);

  const handlePress = (item) => {
    navigation.navigate('detailsP', { attractionId: item.id });
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Fetch data again
    fetchBookmarks().then(() => setRefreshing(false));
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-white flex-1 justify-center items-center p-[20px]">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 mx-5 justify-center">
      <FlatList
        data={places}
        renderItem={({ item }) => (
          <PlacesBox 
            image={item.poster[0]} 
            name={item.name} 
            handlePress={() => handlePress(item)} 
          />
        )}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center ">
            <Text className="font-kbold text-xl">No Bookmark Found</Text>
            <Text className="font-kregular text-md">No Bookmark available at the moment</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

export default BookmarkPlaces;
