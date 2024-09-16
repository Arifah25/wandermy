import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../../constants';
import { useRouter } from 'expo-router';

const Profile = () => {
  const router = useRouter();

  // handle Delete Account process
  const handleDeleteAcc = () => {

  }

  return (
    <SafeAreaView
      className="bg-white h-full flex-1 p-5 items-center justify-start"
    >
      <View
        className="w-full justify-center items-center gap-4 px-5"
      >
        {/* get profile photo from database */}
        <Image
          source={icons.profile}
          className="w-16 h-16 rounded-full"
        />
        <Text
          className="font-kregular text-2xl text-center"
        >
          @putri
        </Text>
        {/* tags */}
        <View
          className="items-start bg-secondary h-24 w-full p-2 rounded-md"
        >
          {/* get from database */}
          <Text
            className="font-pregular"
          >
            #photography
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

    </SafeAreaView>
  )
}

export default Profile;