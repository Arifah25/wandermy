import { View, Text, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import React, { useContext, useEffect, useState } from 'react'
import { CreateItineraryContext } from '../../../../context/CreateItineraryContext'
import moment from 'moment';
import { Button } from '../../../../components';
import { useRouter } from 'expo-router';
import { icons } from '../../../../constants';

const ReviewItinerary = () => {
    const router = useRouter();
    const { itineraryData, setItineraryData } = useContext(CreateItineraryContext);
    const [loading, setLoading] = useState(false);
    
    const handleBack = () => {
      router.back();
    }
  
    return (
      <SafeAreaView className="flex-1 bg-white h-full">
        <View className="flex-row items-center mx-5 mt-6 justify-between">
          <TouchableOpacity onPress={handleBack} style={{  marginTop: 5 }}>
            <Image source={icons.left} style={{ width: 24, height: 24, tintColor: '#000' }} />
          </TouchableOpacity>
        </View>
        <View className=" px-10 w-full">
          <Text className="text-2xl font-kbold text-center">Review your itinerary</Text>
  
          <View>
            <Text className="text-base font-ksemibold my-5">
              Before generating your itinerary, please review your selection
            </Text>
          </View>
          {/* Trip Name */}
          <View className="flex-row mt-5 items-center h-16">
            <Text className="text-3xl items-center justify-center w-1/6">🚀</Text>
            <View>
              <Text className="font-ksemibold text-base text-gray-400">Trip Name:</Text>
              <Text className="font-kregular text-base">{itineraryData?.tripName}</Text>
            </View>
          </View>
          {/* Destination */}
          <View className="flex-row mt-2 items-center h-16">
            <Text className="text-3xl items-center justify-center w-1/6">📍</Text>
            <View>
              <Text className="font-ksemibold text-base text-gray-400">Destination:</Text>
              {/* <Text className="font-kregular text-base">{itineraryData?.locationInfo?.name}</Text> */}
              <Text className="font-kregular text-base">{itineraryData?.location}</Text>
            </View>
          </View>
          {/* Travel Date */}
          <View className="flex-row mt-2 items-center h-16">
            <Text className="text-3xl items-center justify-center w-1/6">🗓️</Text>
            <View>
              <Text className="font-ksemibold text-base text-gray-400">Travel Date:</Text>
              <Text className="font-kregular text-base">
                {moment(itineraryData?.startDate).format('DD MMM')} -{' '}
                {moment(itineraryData?.endDate).format('DD MMM')} ({itineraryData?.totalNoOfDays} days)
              </Text>
            </View>
          </View>
          {/* Traveler */}
          <View className="flex-row mt-2 items-center h-16">
            <Text className="text-3xl items-center justify-center w-1/6">🧳</Text>
            <View>
              <Text className="font-ksemibold text-base text-gray-400">Who is Travelling:</Text>
              <Text className="font-kregular text-base">{itineraryData?.traveler?.title}</Text>
            </View>
          </View>
          {/* Budget */}
          <View className="flex-row mt-2 items-center h-16">
            <Text className="text-3xl items-center justify-center w-1/6">💰</Text>
            <View>
              <Text className="font-ksemibold text-base text-gray-400">Budget:</Text>
              <Text className="font-kregular text-base">{itineraryData?.budget?.title}</Text>
            </View>
          </View>
          {/* Generate Button */}
          <View className="w-full mt-5 items-center h-16">
            <Button
              // title={loading ? 'Generating...' : 'Generate Itinerary'}
              title="Choose Places"
              textColor="text-white"
              style="bg-primary w-4/5 mt-5"
              handlePress={()=> router.push('(tabs)/(itinerary)/(create-itinerary)/choose-places')}
              // disabled={loading} // Disable button while loading
            />
          </View>
        </View>
      </SafeAreaView>
    );
  };
  
  export default ReviewItinerary;