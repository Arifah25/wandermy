import { View, Text, SafeAreaView, FlatList, RefreshControl, ActivityIndicator, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { icons } from '../../../constants'; // Adjust based on your project structure

const badgesData = [
  { name: 'Horizon Seeker', icon: icons.horizonSeeker },
  { name: 'Wanderer’s Crest', icon: icons.wanderersCrest },
  { name: 'Odyssey Voyager', icon: icons.odysseyVoyager },
  { name: 'Pinnacle Explorer', icon: icons.pinnacleExplorer },
];

const MyBadges = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userBadges, setUserBadges] = useState([]);
  const auth = getAuth();
  const db = getDatabase();
  const userId = auth.currentUser?.uid;

  // Fetch user badges from Firebase
  const fetchBadges = async () => {
    if (!userId) {
      console.log('User not logged in');
      setLoading(false);
      return;
    }

    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        const fetchedBadges = userData.badges || []; // Default to empty array if no badges
        setUserBadges(fetchedBadges);
      } else {
        console.log('No user data found');
        setUserBadges([]);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBadges();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-white flex-1 justify-center items-center p-[20px]">
        <ActivityIndicator size="large" color="#A91D1D" />
      </SafeAreaView>
    );
  }

  // Map badges data to match earned badges
  const earnedBadges = badgesData.filter((badge) => userBadges.includes(badge.name));

  return (
    <View className="flex-1 p-5 justify-start bg-white">
      <FlatList
        data={earnedBadges}
        renderItem={({ item }) => (
          <View
            className="justify-center items-center bg-gray-100 p-4 rounded-lg mb-4"
            style={{
              width: 160, // Fixed width for each badge card
              marginRight: 12, // Spacing between cards
            }}
          >
            <Image
              source={item.icon}
              style={{
                width: 80,
                height: 80,
                resizeMode: 'contain',
                marginBottom: 10,
              }}
            />
            <Text className="font-ksemibold text-md text-center">{item.name}</Text>
          </View>
        )}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginHorizontal: 16, marginTop: 10 }}
        ListEmptyComponent={() => (
          <View className="justify-center items-center mt-7">
            <Text className="font-kbold text-xl">No Badges Found</Text>
            <Text className="font-kregular text-md">
              You haven't earned any badges yet. Start exploring to unlock them!
            </Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default MyBadges;
