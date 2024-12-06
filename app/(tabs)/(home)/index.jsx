import axios from 'axios';
import { View, Text, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from "../../../constants";
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import { PlaceCard } from '../../../components';

const Home = () => {
  const [userData, setUserData] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const db = getDatabase();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const router = useRouter();

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
        console.log("Fetched user data:", snapshot.val());
        setUserData(snapshot.val());
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
        //everytime nak run, kena check ipaddress dulu, kena match jugak baru boleh run
        'http://10.75.242.106:5000/recommendations', // Replace with your server's IP
        { userId },
        { timeout: 30000 } // Set timeout to 30 seconds
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
      fetchRecommendations(); // Fetch recommendations
    }, [userId])
  );

  // Handle card press
  const handlePlacePress = (item) => {
    router.push({
      pathname: '(tabs)/(home)/details',
      params: { ...item }, // Pass data to the details page
    });
  };

  return (
    <SafeAreaView className="bg-white h-full flex-1 p-1">
      <View className="flex-row justify-center items-center">
        <View className="items-center justify-center ml-5 mr-7">
          {/* Profile photo */}
          <Image
            source={{ uri: userData.profilePicture } || icons.profile}
            className="rounded-full w-32 h-32 mb-3"
          />
        </View>
        <View className="mx-5 justify-center">
          <Text className="font-kregular text-2xl">Hello !</Text>
          <Text className="mt-4 font-ksemibold text-2xl">{userData.username || "Guest"}</Text>
        </View>
      </View>

      {/* Recommendations Section */}
      <View className="m-4 h-full mt-5" style={{ paddingBottom: 120 }}>
        <Text className="font-kregular text-xl mt-3 mb-3 ml-3">Recommendations for you</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#A91D1D" />
        ) : recommendations.length > 0 ? (
          <FlatList
            data={recommendations}
            renderItem={({ item }) => (
              <PlaceCard
                name={item.name || "Unnamed Place"}
                image={item.poster && item.poster.length > 0 ? item.poster[0] : null}
                handlePress={() => handlePlacePress(item)}
              />
            )}
            keyExtractor={(item, index) => item.placeID || index.toString()}
            numColumns={2} // Display recommendations in a grid
            columnWrapperStyle={{ justifyContent: 'space-between', marginHorizontal: 16, marginTop: 10 }}
          />
        ) : (
          <Text className="text-center mt-5">No recommendations available</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Home;
