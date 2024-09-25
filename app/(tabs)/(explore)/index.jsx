import { View, Text, TouchableOpacity, Image, Modal } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {PlaceCard, Search, TabPlace } from '../../../components'
import { icons } from '../../../constants'
import { useRouter } from 'expo-router'

const Explore = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('attractions');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModalVisibility = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleAdd = () => {
    toggleModalVisibility();
  };

  const addAttraction = () => {
    router.push("(tabs)/(explore)/(create)/attraction");
    toggleModalVisibility();
  };

  const addDining = () => {
    router.push("(tabs)/(explore)/(create)/dining");
    toggleModalVisibility();
  };

  const addEvent = () => {
    router.push("(tabs)/(explore)/(create)/event");
    toggleModalVisibility();
  };

  return (
    <SafeAreaView
    className="bg-white h-full flex-1 px-5 items-center justify-start"
    >
     <View
     className="flex-row items-center -mt-2"
     >
      <Search 
      width="w-5/6"
      />
      <TouchableOpacity>
        <Image
          source={icons.filter}
          className="w-8 h-8 ml-3"
          tintColor='black'
        />
      </TouchableOpacity>

     </View>  
     <TabPlace activeTab={activeTab} setActiveTab={setActiveTab} />    

      <TouchableOpacity
        className="absolute bottom-5 right-5 bg-primary p-4 rounded-full shadow-sm shadow-black"
        onPress={handleAdd}
      >
        <Image source={icons.plus} tintColor="#fff" className="w-7 h-7"/>
      </TouchableOpacity>   
      <View className="flex-row justify-evenly mt-7 w-full">
      <PlaceCard
      name="Petronas Twin Tower"
      handlePress={() => router.push('(tabs)/(explore)/details')} 
      />
      <PlaceCard
      name="KLCC" 
      />
      </View> 
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View className=" flex-1 justify-center items-center blur-xl">
          <View className="border bg-secondary w-[295px] h-[382px] p-[20px] rounded-[8px]">
            <TouchableOpacity
              onPress={toggleModalVisibility}
              className=" absolute top-6 right-6"
            >
              <Image source={icons.close} className="w-5 h-5 align-top"/>
            </TouchableOpacity>
            <Text className="mt-9 font-kregular text-2xl text-center">
              What listing do you want to apply for?
            </Text>
            <View className="flex-1 items-center mt-3">
              <View className="mt-4 bg-white items-center w-3/4 h-12 rounded-md justify-center">
                <TouchableOpacity 
                onPress={addAttraction}
                >
                  <Text className="font-kregular text-xl">
                    Attraction
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="mt-4 bg-white items-center w-3/4 h-12 rounded-md justify-center">
                <TouchableOpacity 
                onPress={addDining}
                >
                  <Text className="font-kregular text-xl">
                    Dining
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="mt-4 bg-white items-center w-3/4 h-12 rounded-md justify-center">
                <TouchableOpacity 
                onPress={addEvent}
                >
                  <Text className="font-kregular text-xl">
                    Event
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}

export default Explore