import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../../constants';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';

const Profile = () => {
  const router = useRouter();

  const [userData, setUserData] = useState([]);

  const auth = getAuth();
  const db = getDatabase();
  const userId = auth.currentUser?.uid;

  const userRef = ref(db, `users/${userId}`);
  get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      setUserData(userData);
      // console.log(userData);
      // // You can access the data like this:
      // console.log(userData.email);
      // console.log(userData.username);
      // console.log(userData.userPreference);
      // console.log(userData.profilePicture);
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });

  // handle Delete Account process
  const handleDeleteAcc = () => {

  }

  const handlePress = (route) ={
    
  }

  return (
    <View
      className="bg-white h-full flex-1 p-5 items-center justify-start"
    >
      <View
        className="w-full justify-center items-center gap-4 px-5"
      >
        {/* get profile photo from database */}
        <Image
          source={{uri:userData.profilePicture} || icons.profile}
          className="w-40 h-40 rounded-full"
        />
        <Text
          className="font-kregular text-2xl text-center lowercase"
        >
          @{userData.username}
        </Text>
        {/* tags */}
        <View
          className="items-start bg-secondary h-24 w-full p-[10px] rounded-md"
        >
          {/* get from database */}
          <Text
            className="font-pregular"
          >
            {userData.userPreference}
          </Text>
        </View>
      </View>
      <View
        className="justify-evenly w-11/12 px-5 mt-11"
      >
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/(profile)/edit')} // Navigate to Edit Profile page
          className="border-t-0.5"
        >
          <Text 
            className="font-kregular text-xl my-4 text-center"
          >
            Edit Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/(profile)/bookmark')} // Navigate to Bookmark Places page
          className="border-t-0.5"
        >
          <Text 
            className="font-kregular text-xl my-4 text-center"
          >
            Bookmark Places
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/(profile)/itinerary")} // Navigate to My Itineraries page
          className="border-y-0.5"
        >
          <Text 
            className="font-kregular text-xl my-4 text-center"
          >
            My Itineraries
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDeleteAcc} // Navigate to Delete Account page
          className="border-y-0.5"
        >
          <Text 
            className="text-primary font-kregular text-xl my-4 text-center"
          >
            Delete Account
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace('(auth)/sign-in')} // Navigate to Login page (logout)
          className="border-y-0.5"
        >
          <Text 
            className="text-primary font-kregular text-xl my-5 text-center"
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}

export default Profile;