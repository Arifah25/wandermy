import axios from 'axios';
import { View, Text, Image, FlatList, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from "../../../constants";
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, push, set } from 'firebase/database';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import { PlaceCard, PlaceCardHome } from '../../../components';

const logUserInteraction = async (placeID) => {
  const db = getDatabase();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (!userId) return; // Ensure user is logged in

  try {
    const interactionRef = ref(db, `user_interactions/${userId}`);

    // Fetch existing interactions
    const snapshot = await get(interactionRef);
    const interactions = snapshot.val();

    if (interactions) {
      const interactionEntries = Object.entries(interactions); // Convert to an array of [key, value]
      
      // If there are 30 or more interactions, find the oldest one by timestamp and delete it
      if (interactionEntries.length >=10){
        const oldestInteraction = interactionEntries.reduce((oldest, current) =>
          new Date(oldest[1].timestamp) < new Date(current[1].timestamp) ? oldest : current
        );

        const oldestKey = oldestInteraction[0]; // Get the key of the oldest interaction
        await set(ref(db, `user_interactions/${userId}/${oldestKey}`), null); // Delete the oldest interaction
      }
    }

    // Add the new interaction
    const newInteractionRef = push(interactionRef);
    await set(newInteractionRef, {
      placeID,
      timestamp: new Date().toISOString(),
    });

    console.log("User interaction logged successfully.");
  } catch (error) {
    console.error("Error logging user interaction:", error);
  }
};

const Home = () => {
  const [userData, setUserData] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [loading, setLoading] = useState(true);

  const db = getDatabase();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const router = useRouter();

  // Fetch recently added places
  const fetchRecentlyAdded = async () => {
    try {
      const placesRef = ref(db, 'places');
      const snapshot = await get(placesRef);

      if (snapshot.exists()) {
        const places = Object.entries(snapshot.val())
          .map(([placeID, placeData]) => ({
            placeID,
            ...placeData,
            dateApproved: new Date(placeData.dateApproved), // Convert to Date object
          }))
          .sort((a, b) => b.dateApproved - a.dateApproved) // Sort by latest dateApproved
          .slice(0, 10); // Limit to the 10 most recent places

        setRecentlyAdded(places);
        console.log("Recently added places:", places);
      }
    } catch (error) {
      console.error("Error fetching recently added places:", error);
    }
  };

  // Fetch user details
  const fetchUserDetails = async () => {
    if (!userId) {
      console.error("User ID is not available.");
      return;
    }
  
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
  
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUserData(userData);
        console.log("Fetched user data:", userData);
  
        // Check and add badges based on user points
        if (userData.points) {
          checkAndAddBadges(userData.points);
        }
      } else {
        console.log("No user data available.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  

  // Fetch recommendations
  const fetchRecommendations = async () => {
    if (!userId) {
      console.error("User ID is not available.");
      return;
    }

    setLoading(true); // Start loading indicator
    try {
      console.log("Fetching recommendations...");
      const response = await axios.post(
        'http://172.20.10.11:5000/recommendations', // Flask endpoint
        { userId }, // The payload
        {
          headers: {
            'Content-Type': 'application/json', // Ensure correct content type
          },
          timeout: 30000, // Timeout for the request
        }
      );
      console.log("Backend response:", response.data);

      if (response.data.recommendations) {
        const placeIDs = response.data.recommendations.map((rec) => rec.placeID);
        console.log("Fetched Place IDs:", placeIDs);

        const placesPromises = placeIDs.map(async (placeID) => {
          const placeRef = ref(db, `places/${placeID}`);
          const snapshot = await get(placeRef);
          if (snapshot.exists()) {
            return { ...snapshot.val(), placeID };
          }
          return null;
        });

        const placesData = await Promise.all(placesPromises);
        const validPlaces = placesData.filter((place) => place !== null);
        console.log("Valid Places Data:", validPlaces);

        setRecommendations([...validPlaces]); // Force re-render
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      Alert.alert("Error", "Unable to fetch recommendations. Please try again.");
    } finally {
      setLoading(false); // End loading indicator
    }
  };

  // Update recommendations every time the home page is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log("Home screen focused: Fetching data...");
      fetchUserDetails(); // Fetch user details
      fetchRecentlyAdded(); // Fetch recently added places
      fetchRecommendations(); // Fetch recommendations
    }, [userId])
  );

  // Handle card press
  const handlePlacePress = (item) => {
    logUserInteraction(item.placeID);
    router.push({
      pathname: '/(tabs)/(home)/details',
      params: { ...item }, // Pass data to the details page
    });
  };

  const checkAndAddBadges = async (points) => {
    const db = getDatabase();
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
  
    if (!userId) return;
  
    try {
      const badgesRef = ref(db, `users/${userId}/badges`);
      const snapshot = await get(badgesRef);
      const existingBadges = snapshot.exists() ? snapshot.val() : [];
  
      // Define badges and their point thresholds
      const badges = [
        { points: 100, badge: 'Horizon Seeker' },
        { points: 200, badge: 'Wanderer’s Crest' },
        { points: 300, badge: 'Odyssey Voyager' },
        { points: 400, badge: 'Pinnacle Explorer' },
      ];
  
      // Determine badges to add
      const earnedBadges = badges
        .filter((badge) => points >= badge.points && !existingBadges.includes(badge.badge))
        .map((badge) => badge.badge);
  
      if (earnedBadges.length > 0) {
        // Update badges in Firebase
        const updatedBadges = [...existingBadges, ...earnedBadges];
        await set(badgesRef, updatedBadges);
        console.log('Badges updated successfully:', updatedBadges);
      }
    } catch (error) {
      console.error('Error updating badges:', error);
    }
  };
  

  // Render each section
  const renderHeader = () => (
    <View className="flex-row justify-center items-center mt-8">
      <View className="items-center justify-center ml-5 mr-7">
        <View
          style={{
            width: 140, // Adjust size for larger container
            height: 140, // Adjust size for larger container
            borderRadius: 85, // Should match half of the width/height for a perfect circle
            borderWidth: 1, // Thickness of the border
            borderColor: 'black', // Border color
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            source={{ uri: userData.profilePicture} || icons.profile } // Ensure valid URI
            className="rounded-full w-32 h-32"
          />
        </View>
      </View>
      <View className="mx-5 justify-center">
        <Text className="font-kregular text-2xl">Hello!</Text>
        <Text className="mt-2 font-ksemibold text-2xl">{userData.username || 'Guest'}</Text>
        {/* <Text className="font-kregular text-lg mt-2">
          Points: <Text className="font-ksemibold">{userData.points || 0}</Text>
        </Text> */}
      </View>
    </View>
  );
  
  const renderPointsContainer = () => {
    const points = userData.points || 0;
  
    // Define milestones
    const milestones = [100, 200, 300, 400];
    const currentMilestone = milestones.find((milestone) => points < milestone) || milestones[milestones.length - 1];
  
    const progress = (points / currentMilestone) * 100; // Calculate progress percentage for the current milestone
  
    return (
      <TouchableOpacity
        onPress={() => {
          console.log('Navigating to Points Page');
          router.push('(tabs)/(home)/points');
          params: { points: userData.points || 0 };
        }}// Redirect to points.jsx
        activeOpacity={0.8} // Set the opacity effect for better UX
      >
        <View className="bg-white rounded-lg p-4 mt-7 ml-5 mr-5 mb-2 shadow-md">
          <Text className="font-ksemibold text-xl mb-2">Your Progress</Text>
          <Text className="font-kregular text-lg mb-4">
            Points: <Text className="font-ksemibold">{points}</Text>/{currentMilestone}
          </Text>
  
          {/* Progress Bar */}
          <View className="w-full h-4 bg-gray-300 rounded-full">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </View>
  
          {/* Badge Info */}
          <Text className="font-kregular text-sm mt-4 text-gray-600">
            {points < 400
              ? `Earn ${currentMilestone - points} more points to unlock the next badge!`
              : `You’ve reached the maximum badge milestone. Keep exploring for fun!`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };  
  
  const renderRecentlyAdded = () => (
    <View className="bg-white rounded-lg p-4 mt-4 ml-5 mr-5 mb-2 shadow-md">
      <Text className="font-ksemibold text-xl mb-2">Recently Added</Text>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 8,
        }}
      >
        {recentlyAdded.map((item, index) => (
          <View
            key={index}
            style={{
              width: 160, // Fixed width for all PlaceCards
              marginRight: 12, // Space between cards
            }}
          >
            <PlaceCardHome
              name={item.name || 'Unnamed Place'} // Fallback for name
              image={item.poster ? item.poster[0] : null} // Fallback for image
              handlePress={() => handlePlacePress(item)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
  
  
  const renderRecommendations = () => (
    <View className="bg-white rounded-lg p-4 mt-4 ml-5 mr-5 mb-2 shadow-md">
      <Text className="font-ksemibold text-xl mb-2">Recommendations for you</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#A91D1D" />
      ) : recommendations.length > 0 ? (
        <FlatList
          data={recommendations}
          renderItem={({ item }) => (
            <PlaceCard
              name={item.name || 'Unnamed Place'} // Provide fallback
              image={item.poster ? item.poster[0] : null} // Ensure valid image
              handlePress={() => handlePlacePress(item)}
            />
          )}
          keyExtractor={(item) => item.placeID.toString()}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginHorizontal: 10,
            marginBottom: 10,
          }}
        />
      ) : (
        <Text className="text-center mt-5">No recommendations available</Text>
      )}
    </View>
  );
  
  return (
    <View className="bg-white h-full flex-1">
      <FlatList
        data={[
          { key: 'header' },
          { key: 'pointsContainer' }, // Add the new container here
          { key: 'recentlyAdded' },
          { key: 'recommendations' },
        ]}
        renderItem={({ item }) => {
          switch (item.key) {
            case 'header':
              return renderHeader();
            case 'pointsContainer': // Render the points container
              return renderPointsContainer();
            case 'recentlyAdded':
              return renderRecentlyAdded();
            case 'recommendations':
              return renderRecommendations();
            default:
              return null;
          }
        }}
        keyExtractor={(item) => item.key}
      />
    </View>
  );  
};

export default Home;