import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { useRouter } from "expo-router";
import { icons } from "../../../constants";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const auth = getAuth();
  const db = getDatabase();
  const userId = auth.currentUser?.uid; // Get current user ID
  const router = useRouter();

  useEffect(() => {
    if (userId) {
        const placesRef = ref(db, 'places');
        const unsubscribe = onValue(placesRef, (snapshot) => {
        const data = snapshot.val();
        const userNotifications = [];

        // Filter places for the logged-in user
        Object.keys(data).forEach((placeID) => {
          const place = data[placeID];
          if (place.user === userId && place.status === "approved") {
            userNotifications.push({
              id: placeID,
              message: `${place.name} has been approved!`,
              placeID,
              poster: place.poster,
            });
          }
        });

        setNotifications(userNotifications);
      });

      return () => unsubscribe(); // Cleanup listener
    }
  }, [userId]);

  //tak functioning lagi
  const handleNotificationClick = (placeID) => {
    router.push({
        pathname: '(tabs)/(explore)/details',
        params: { ...placeID }, // Pass all the place data as route params
    });
  };

  return (
    <View className="flex-1 p-5 bg-white">
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            console.log(item?.poster),
          <TouchableOpacity
            className="p-3 mb-4 bg-gray-200 rounded"
            onPress={() => handleNotificationClick(item.placeID)}
            style={{ flexDirection: 'row', alignItems: 'center' }} // Align text and image horizontally
          >
            {/* poster not showing  */}
            {/* Poster image */}
            <Image
              // source={item.poster ? { uri: item.poster } : null}// Use the 'poster' URL
              source={{ uri: item.poster[0] }}
              style={{
                width: 65,  // Set width and height to make it square
                height: 65,
                borderRadius: 4, // Optional: round corners of the poster
                marginRight: 14, // Space between image and text
                // borderWidth: 2,   // Add a border around the image box
                // borderColor: 'gray',  // Set the border color
                backgroundColor: '#f0f0f0',
              }}
              resizeMode="auto" // Ensures the image covers the square area without distorting
            />

            {/* Notification text */}
            <Text 
            className="text-black text-[15px]"
            style={{
                flex: 1, // Allow text to take up available space
                overflow: 'hidden', // Hide overflowed text
              }}>{item.message}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Notification;

//poster not showing
//not redirecting to the details page of the specific place
