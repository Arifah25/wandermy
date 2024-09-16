import { View, Text, Image, TextInput } from 'react-native'
import React, { useState } from 'react'
import { icons } from '../../../constants';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router';
import { Button } from '../../../components';

const EditProfile = () => {
  //for navigation
  const router = useRouter();

  //Initialize state variables
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [tags, setTags] = useState("");

  const updateProfile = () => {
    //update profile logic here
  }

  return (
    <SafeAreaView
    className="bg-white h-full flex-1 p-5 justify-start"
    >
      <View
      className="items-center"
      >
        {/* get profile photo from database */}
        <Image
          source={icons.profile}
          className="w-16 h-16 rounded-full"
        />
      </View>
      <View
      className="w-full mt-7 px-5 flex-row items-center justify-center"
      >
        <Text
        className="font-kregular text-base w-24"
        >
          Username
        </Text>
        <View 
        className="w-56 bg-white rounded-md h-8 justify-center border-2 border-secondary focus:border-black"
        >
          <TextInput
          className="font-pregular ml-3"
          //value={value}
          // placeholder={placeholder}
          placeholderTextColor="#7E6C6C"
          onChangeText={(value) => setUsername(value)}
          />
        </View>
      </View>
      <View
      className="w-full mt-7 px-5 flex-row items-center justify-center"
      >
        <Text
        className="font-kregular text-base w-24"
        >
          Email
        </Text>
        <View 
        className="w-56 bg-white rounded-md h-8 justify-center border-2 border-secondary focus:border-black"
        >
          <TextInput
          className="font-pregular ml-3"
          //value={value}
          // placeholder={placeholder}
          placeholderTextColor="#7E6C6C"
          onChangeText={(value) => setEmail(value)}
          />
        </View>
      </View>

      <View
      className="my-10 px-5"
      >
        <Text
        className="font-kregular text-base"
        >
          User preferences (optional)
        </Text>
        <View 
        className="mt-3 w-full bg-white rounded-md h-40 justify-start border-2 border-secondary focus:border-black"
        >
          <TextInput
          className="font-pregular m-3"
          //value={value}
          // placeholder={placeholder}
          placeholderTextColor="#7E6C6C"
          onChangeText={(value) => setTags(value)}
          />
        </View>
      </View>
      <View
      className="px-5 items-center">
        <Button 
          title="Update"
          handlePress={updateProfile}
          style="bg-secondary w-1/3"
        />
      </View>
    </SafeAreaView>
  )
}

export default EditProfile