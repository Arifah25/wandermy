import { View, Text, Image, FlatList } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons } from "../../../constants";
const Home = () => {
  return (
    <SafeAreaView
    className="bg-white h-full flex-1 px-5"
    >
      <View
      className="flex-row justify-center items-center"
      >
        <View
        className="items-center justify-center -ml-5 mr-7"
        >
          {/* get profile photo from database */}
          <Image
          source={icons.profile}
          className="rounded-full w-24 h-24"
          />
        </View>
        <View
        className="mx-5 justify-center"
        >
          <Text
          className="font-kregular text-2xl"
          >
            Hello !
          </Text>
          <Text
          className="mt-4 font-ksemibold text-2xl"
          >
            {/* get name from database */}
            PUTRI
          </Text>
        </View>
      </View>
      {/* get recommended places from database */}
      <View
      className="m-4 bg-secondary h-full"
      >
        <Text
        className="font-kregular text-xl"
        >
          Recommendations for you 
        </Text>
        <View 
        className="items-center"
        >
          <FlatList
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Home