import axios from 'axios';
import { View, Text, Image, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from "../../../constants";
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, push, set } from 'firebase/database';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import { PlaceCard } from '../../../components';

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
        'http://10.167.74.150:5000/recommendations', // Flask endpoint
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
      pathname: '(tabs)/(home)/details',
      params: { ...item }, // Pass data to the details page
    });
  };

  // Render each section
  const renderHeader = () => (
    <View className="flex-row justify-center items-center">
      <View className="items-center justify-center ml-5 mr-7">
        <Image
          source={{ uri: userData.profilePicture || icons.profile }} // Ensure valid URI
          className="rounded-full w-32 h-32 mb-3"
        />
      </View>
      <View className="mx-5 justify-center">
        <Text className="font-kregular text-2xl">Hello!</Text>
        <Text className="mt-2 font-ksemibold text-2xl">{userData.username || 'Guest'}</Text>
      </View>
    </View>
  );

  const renderRecentlyAdded = () => (
    <View className="mt-4 ml-5 mr-5">
      <Text className="font-kregular text-xl mt-3 mb-3 ml-3">Recently Added</Text>
      <FlatList
        data={recentlyAdded}
        renderItem={({ item }) => (
          <View style={{ marginLeft: 12 }}>
            <PlaceCard
              name={item.name || 'Unnamed Place'} // Provide fallback
              image={item.poster ? item.poster[0] : null} // Ensure valid image
              handlePress={() => handlePlacePress(item)}
            />
          </View>
        )}
        keyExtractor={(item) => item.placeID.toString()}
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{
          paddingHorizontal: 5,
          marginBottom: 10,
        }}
        style={{
          maxHeight: 250,
        }}
      />
    </View>
  );
  
  const renderRecommendations = () => (
    <View className="ml-4 mr-4 mt-3">
      <Text className="font-kregular text-xl mb-3 ml-4">Recommendations for you</Text>
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
            marginHorizontal: 16,
            marginBottom: 10,
          }}
        />
      ) : (
        <Text className="text-center mt-5">No recommendations available</Text>
      )}
    </View>
  );
  

//   return (
//     <SafeAreaView className="bg-white h-full flex-1 p-1">
//       <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
//         <View className="flex-row justify-center items-center">
//           <View className="items-center justify-center ml-5 mr-7">
//             {/* Profile photo */}
//             <Image
//               source={{ uri: userData.profilePicture } || icons.profile}
//               className="rounded-full w-32 h-32 mb-3"
//             />
//           </View>
//           <View className="mx-5 justify-center">
//             <Text className="font-kregular text-2xl">Hello !</Text>
//             <Text className="mt-2 font-ksemibold text-2xl">{userData.username || "Guest"}</Text>
//           </View>
//         </View>

//         {/* Recently Added Section */}
//         <View className="m-4">
//           <Text className="font-kregular text-xl mt-3 mb-3 ml-3">Recently Added</Text>
//           <FlatList
//             data={recentlyAdded}
//             renderItem={({ item }) => (
//               <PlaceCard
//                 name={item.name || "Unnamed Place"}
//                 image={item.poster && item.poster.length > 0 ? item.poster[0] : null}
//                 handlePress={() => handlePlacePress(item)}
//               />
//             )}
//             keyExtractor={(item) => item.placeID}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={{ paddingHorizontal: 16 }}
//           />
//         </View>

//         {/* Recommendations Section */}
//         <View className="m-4">
//           <Text className="font-kregular text-xl mt-3 mb-3 ml-3">Recommendations for you</Text>
//           {loading ? (
//             <ActivityIndicator size="large" color="#A91D1D" />
//           ) : recommendations.length > 0 ? (
//             <FlatList
//               data={recommendations}
//               renderItem={({ item }) => (
//                 <PlaceCard
//                   name={item.name || "Unnamed Place"}
//                   image={item.poster && item.poster.length > 0 ? item.poster[0] : null}
//                   handlePress={() => handlePlacePress(item)}
//                 />
//               )}
//               keyExtractor={(item, index) => item.placeID || index.toString()}
//               numColumns={2} // Display recommendations in a grid
//               columnWrapperStyle={{ justifyContent: 'space-between', marginHorizontal: 16, marginTop: 10 }}
//             />
//           ) : (
//             <Text className="text-center mt-5">No recommendations available</Text>
//           )}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };
return (
  <SafeAreaView className="bg-white h-full flex-1">
    <FlatList
      data={[{ key: 'header' }, { key: 'recentlyAdded' }, { key: 'recommendations' }]}
      renderItem={({ item }) => {
        switch (item.key) {
          case 'header':
            return renderHeader();
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
  </SafeAreaView>
);
};

export default Home;
