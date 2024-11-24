import { View, Text, Image, FlatList } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons } from "../../../constants";
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';

const Home = () => {
  const [userData, setUserData] = useState([]);

  const auth = getAuth();
  const db = getDatabase();
  const userId = auth.currentUser?.uid;

  const userRef = ref(db, `users/${userId}`);
  get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      setUserData(userData);
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });

  return (
    <View className="bg-white h-full flex-1 p-5">
      <View className="flex-row justify-center items-center">
        <View className="items-center justify-center -ml-5 mr-7">
          {/* get profile photo from database */}
          <Image
          source={{uri: userData.profilePicture} || icons.profile}
          className="rounded-full w-32 h-32"
          />
        </View>
        <View className="mx-5 justify-center">
          <Text className="font-kregular text-2xl">
            Hello !
          </Text>
          <Text className="mt-4 font-ksemibold text-2xl">
            {/* get name from database */}
            {userData.username}
          </Text>
        </View>
      </View>
      {/* get recommended places from database */}
      <View className="m-4 h-full">
        <Text className="font-kregular text-xl">
          Recommendations for you 
        </Text>
        <View className="items-center">
          <FlatList/>
        </View>
      </View>
    </View>
  )
}

export default Home