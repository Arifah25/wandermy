import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { icons } from '../../../constants'; // Adjust the path to your icons

const Points = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getDatabase();
  const userId = auth.currentUser?.uid; // Get the logged-in user's ID

  const badges = [
    { 
      points: 100, 
      badge: 'Horizon Seeker Badge', 
      description: 'Embark on your first journey to explore new horizons.', 
      icon: icons.horizonSeeker 
    },
    { 
      points: 200, 
      badge: 'Wanderer’s Crest Badge', 
      description: 'Show your spirit of adventure by visiting more destinations.', 
      icon: icons.wanderersCrest 
    },
    { 
      points: 300, 
      badge: 'Odyssey Voyager Badge', 
      description: 'Demonstrate your passion for travel by reaching faraway lands.', 
      icon: icons.odysseyVoyager 
    },
    { 
      points: 400, 
      badge: 'Pinnacle Explorer Badge', 
      description: 'Achieve legendary status by conquering the ultimate milestone.', 
      icon: icons.pinnacleExplorer 
    },
  ];

  // Fetch user's points and badges from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId) {
          Alert.alert('Error', 'User not logged in.');
          setLoading(false);
          return;
        }

        const userRef = ref(db, `users/${userId}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserPoints(userData.points || 0); // Default to 0 if points are undefined
          setUserBadges(userData.badges || []); // Default to an empty array if badges are undefined
        } else {
          console.log('No user data found.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to fetch user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#A91D1D" />
      </View>
    );
  }

  // Filter badges to show only the ones the user has achieved
  const achievedBadges = Array.isArray(userBadges)
    ? badges.filter((badge) => userBadges.includes(badge.badge))
    : [];

  return (
    <View className="flex-1 bg-white p-5">
      <ScrollView>
        {/* Progress Container */}
        <View className="bg-white rounded-lg p-4 shadow-md mb-6">
          <Text className="font-ksemibold text-xl mb-2">Your Points</Text>
          <Text className="font-kregular text-lg mb-4">
            Points: <Text className="font-ksemibold">{userPoints}</Text>/400
          </Text>

          {/* Progress Bar */}
          <View className="w-full h-4 bg-gray-300 rounded-full">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${(userPoints / 400) * 100}%` }}
            />
          </View>

          <Text className="font-kregular text-sm mt-4 text-gray-600">
            Keep earning points to unlock exciting badges!
          </Text>
        </View>

        {/* My Badges */}
        <View className="bg-white rounded-lg p-4 mt-4 mb-2 shadow-md">
          <Text className="font-ksemibold text-xl mb-4 ml-2">My Badges</Text>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 8,
            }}
          >
            {achievedBadges.length > 0 ? (
              achievedBadges.map((badge, index) => (
                <View
                  key={index}
                  style={{
                    width: 110, // Fixed width for each badge card
                    marginRight: 12, // Space between badge cards
                    alignItems: 'center', // Center the content within the card
                  }}
                >
                  <Image
                    source={badge.icon} // Use the icon for the badge
                    style={{
                      width: 80, // Adjust size for the icon
                      height: 80,
                      resizeMode: 'contain',
                      marginBottom: 10,
                    }}
                  />
                  <Text className="font-ksemibold text-center">
                    {badge.badge.replace(' Badge', '')} {/* Remove the word "Badge" */}
                </Text>
                </View>
              ))
            ) : (
              <Text className="text-center text-gray-500">
                You haven’t earned any badges yet.
              </Text>
            )}
          </ScrollView>
        </View>

        <View className="bg-gray-200 p-4 rounded-lg mb-6 mt-6 ">
            <Text className="font-kbold text-xl mb-3">How to Earn Points</Text>
            <Text className="font-kregular text-lg">
                Review an attraction/dining place:
            </Text>
            <Text className="font-ksemibold text-lg mb-3">+ 5 points</Text>

            <Text className="font-kregular text-lg mt-2">
                Submit a listing request and get approval from admin:
            </Text>
            <Text className="font-ksemibold text-lg">+ 15 points</Text>
        </View>
        {/* Badges to Unlock */}
        <Text className="font-kbold text-xl mb-3">Badges to Unlock</Text>
        {badges.map((badge, index) => (
          <View
            key={index}
            className="bg-red-100 p-4 mb-3 rounded-lg flex-row items-center justify-between"
          >
            <View className="flex-row items-center" style={{ flex: 1 }}>
              <Image
                source={badge.icon} // Badge icon
                style={{
                  width: 50,
                  height: 50,
                  resizeMode: 'contain',
                  marginRight: 10,
                }}
              />
              <View className="mr-3">
                <Text className="font-ksemibold text-lg">{badge.badge}</Text>
                <Text className="font-kregular text-gray-600 text-sm">
                  {badge.points} Points
                </Text>
                <Text className="font-k text-gray-500 text-sm italic mt-1 mr-9">
                  {badge.description}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
export default Points;
