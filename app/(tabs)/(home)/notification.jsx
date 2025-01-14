import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { useRouter } from "expo-router";
import { icons } from "../../../constants";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(7); // Number of visible notifications
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Flag for loading more notifications
  const auth = getAuth();
  const db = getDatabase();
  const userId = auth.currentUser?.uid; // Get current user ID
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      const placesRef = ref(db, "places");
      const unsubscribe = onValue(placesRef, (snapshot) => {
        const data = snapshot.val();
        const userNotifications = [];

        // Filter places for the logged-in user
        if (data) {
          Object.keys(data).forEach((placeID) => {
            const place = data[placeID];
            if (place.user === userId) {
              if (place.status === "approved") {
                userNotifications.push({
                  id: placeID,
                  message: `Congratulations! ${place.name} has been approved!`,
                  placeID,
                  poster: place.poster,
                  timestamp: new Date(place.dateApproved || Date.now()), // Assuming dateApproved is stored
                });
              } else if (place.status === "rejected") {
                userNotifications.push({
                  id: placeID,
                  message: `We're sorry to inform you but ${place.name} has been rejected.`,
                  placeID,
                  poster: place.poster,
                  timestamp: new Date(place.dateApproved || Date.now()), // Assuming dateApproved is stored
                });
              }
            }
          });

          // Sort notifications by timestamp (latest first)
          userNotifications.sort((a, b) => b.timestamp - a.timestamp);
        }

        setAllNotifications(userNotifications);
        setNotifications(userNotifications.slice(0, visibleCount));
        setIsLoading(false);
      });

      return () => unsubscribe(); // Cleanup listener
    }
  }, [userId, visibleCount]);

  const loadMoreNotifications = () => {
    if (notifications.length < allNotifications.length && !isLoadingMore) {
      setIsLoadingMore(true); // Start loading indicator for more notifications
      const newCount = Math.min(visibleCount + 5, allNotifications.length);
      setTimeout(() => {
        setVisibleCount(newCount);
        setNotifications(allNotifications.slice(0, newCount));
        setIsLoadingMore(false); // Stop loading indicator
      }, 1000); // Simulate network delay
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setVisibleCount(20); // Reset to initial 20 notifications
      setNotifications(allNotifications.slice(0, 20));
      setIsRefreshing(false);
    }, 1000); // Simulate a delay for refreshing
  };

  const handleNotificationClick = (placeID) => {
    router.push({
      pathname: "(tabs)/(explore)/details",
      params: { placeID }, // Pass the placeID as a route parameter
    });
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      className="p-3 mb-4 bg-gray-200 rounded"
      onPress={() => handleNotificationClick(item.placeID)}
      style={{ flexDirection: "row", alignItems: "center" }} // Align text and image horizontally
    >
      {/* Poster image */}
      <Image
        source={
          item.poster && item.poster.length > 0
            ? { uri: item.poster[0] }
            : icons.placeholder // Fallback to a placeholder if poster is missing
        }
        style={{
          width: 65, // Set width and height to make it square
          height: 65,
          borderRadius: 4, // Optional: round corners of the poster
          marginRight: 14, // Space between image and text
          backgroundColor: "#f0f0f0",
        }}
        resizeMode="cover" // Ensures the image covers the square area without distorting
      />

      {/* Notification text */}
      <Text
        className="text-black text-[15px]"
        style={{
          flex: 1, // Allow text to take up available space
          overflow: "hidden", // Hide overflowed text
        }}
      >
        {item.message}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 p-5 bg-white">
      {isLoading ? (
        <ActivityIndicator size="large" color="#A91D1D" />
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          onEndReachedThreshold={0.5} // Trigger loading more notifications as the user scrolls down
          onEndReached={loadMoreNotifications} // Call to load more notifications
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh} // Force load more on swipe down
              colors={["#A91D1D"]} // Customize refresh control color
            />
          }
          ListFooterComponent={
            isLoadingMore && (
              <View className="py-5">
                <ActivityIndicator size="small" color="#A91D1D" />
              </View>
            )
          }
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-lg">No notifications</Text>
        </View>
      )}
    </View>
  );
};

export default Notification;
