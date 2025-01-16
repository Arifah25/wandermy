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
import { getDatabase, ref, onValue, get } from "firebase/database";
import { useRouter } from "expo-router";
import { icons } from "../../../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(7);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewedNotifications, setViewedNotifications] = useState([]); // Track viewed notifications
  const auth = getAuth();
  const db = getDatabase();
  const userId = auth.currentUser?.uid;
  const router = useRouter();

  useEffect(() => {
    // Fetch notifications from the database
    if (userId) {
      const placesRef = ref(db, "places");
      const unsubscribe = onValue(placesRef, async (snapshot) => {
        const data = snapshot.val();
        const userNotifications = [];

        if (data) {
          await Promise.all(
            Object.keys(data).map(async (placeID) => {
              const place = data[placeID];
              if (place.user === userId) {
                const placeDetailsRef = ref(db, `places/${placeID}`);
                const placeDetailsSnapshot = await get(placeDetailsRef);
                const placeDetails = placeDetailsSnapshot.val() || {};

                if (place.status === "approved") {
                  userNotifications.push({
                    id: placeID,
                    message: `Congratulations! ${placeDetails.name} has been approved!`,
                    ...placeDetails,
                    timestamp: new Date(place.dateApproved || Date.now()),
                  });
                } else if (place.status === "rejected") {
                  userNotifications.push({
                    id: placeID,
                    message: `We're sorry to inform you but ${placeDetails.name} has been rejected.`,
                    ...placeDetails,
                    timestamp: new Date(place.dateRejected || Date.now()),
                  });
                }
              }
            })
          );

          userNotifications.sort((a, b) => b.timestamp - a.timestamp);
        }

        setAllNotifications(userNotifications);
        setNotifications(userNotifications.slice(0, visibleCount));
        setIsLoading(false);
      });

      // Load viewed notifications from AsyncStorage
      const loadViewedNotifications = async () => {
        const storedViewed = await AsyncStorage.getItem("viewedNotifications");
        if (storedViewed) {
          setViewedNotifications(JSON.parse(storedViewed));
        }
      };

      loadViewedNotifications();

      return () => unsubscribe(); // Cleanup listener
    }
  }, [userId, visibleCount]);

  const loadMoreNotifications = () => {
    if (notifications.length < allNotifications.length && !isLoadingMore) {
      setIsLoadingMore(true);
      const newCount = Math.min(visibleCount + 5, allNotifications.length);
      setTimeout(() => {
        setVisibleCount(newCount);
        setNotifications(allNotifications.slice(0, newCount));
        setIsLoadingMore(false);
      }, 1000);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setVisibleCount(20);
      setNotifications(allNotifications.slice(0, 20));
      setIsRefreshing(false);
    }, 1000);
  };

  const handleNotificationClick = async (item) => {
    if (!viewedNotifications.includes(item.id)) {
      const updatedViewed = [...viewedNotifications, item.id];
      setViewedNotifications(updatedViewed);
      await AsyncStorage.setItem(
        "viewedNotifications",
        JSON.stringify(updatedViewed)
      );
    }

    router.push({
      pathname: "(tabs)/(home)/details",
      params: { ...item },
    });
  };

  const renderNotification = ({ item }) => {
    const isViewed = viewedNotifications.includes(item.id);

    return (
      <TouchableOpacity
        className="p-3 mb-4 rounded"
        onPress={() => handleNotificationClick(item)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isViewed ? "#F5F5F5" : "#E0E0E0", // Lighter background for viewed notifications
        }}
      >
        <Image
          source={
            item.poster && item.poster.length > 0
              ? { uri: item.poster[0] }
              : icons.placeholder
          }
          style={{
            width: 65,
            height: 65,
            borderRadius: 4,
            marginRight: 14,
            backgroundColor: "#f0f0f0",
          }}
          resizeMode="cover"
        />
        <Text
          className="text-black text-[15px]"
          style={{
            flex: 1,
            overflow: "hidden",
          }}
        >
          {item.message}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 p-5 bg-white">
      {isLoading ? (
        <ActivityIndicator size="large" color="#A91D1D" />
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          onEndReachedThreshold={0.5}
          onEndReached={loadMoreNotifications}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#A91D1D"]}
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
