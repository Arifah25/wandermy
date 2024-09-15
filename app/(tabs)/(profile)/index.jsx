import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons } from '../../../constants'
import { useRouter } from 'expo-router'

const Profile = () => {
  // Use the useRouter hook to get the router object for navigation
  const router = useRouter();

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
        className="font-kregular text-2xl text-center">
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
        onPress={() => router.push("(tabs)/(profile)/edit")}
        className="border-t-0.5"
        >
          <Text 
          className="font-kregular text-xl my-4 text-center"
          >
            Edit Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
        className="border-t-0.5"
        >
          <Text 
          className="font-kregular text-xl my-4 text-center"
          >
            Bookmark Places
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
        className="border-y-0.5"
        >
          <Text 
          className="font-kregular text-xl my-4 text-center"
          >
            My Itineraries
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
        className="border-y-0.5"
        >
          <Text 
          className="font-kregular text-xl my-4 text-center"
          >
            Delete Account
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
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

export default Profile