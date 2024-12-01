import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { CreateItineraryContext } from '../../../../context/CreateItineraryContext'
import moment from 'moment';
import { AI_PROMPT } from '../../../../constants/option';
import { chatSession } from '../../../../configs/AImodule';
import { setDoc, doc } from 'firebase/firestore';
import { auth, firestore } from '../../../../configs/firebaseConfig';
import { Button } from '../../../../components';
import { useRouter } from 'expo-router';

const ReviewItinerary = () => {

    const router = useRouter();
    const {itineraryData, setItineraryData} = useContext(CreateItineraryContext);
    const [loading, setLoading] = useState(false);
    const user = auth.currentUser;

    useEffect(() => {
        GenerateAiItinerary();
    }, []);

    const GenerateAiItinerary = async() => {
      setLoading(true);
      const FINAL_PROMPT = AI_PROMPT
      .replace('{location}', itineraryData?.locationInfo?.name)
      .replace('{totalDays}', itineraryData?.totalNoOfDays)
      .replace('{totalNights}', itineraryData?.totalNoOfDays - 1)
      .replace('{traveler}', itineraryData?.traveler?.title)
      .replace('{budget}', itineraryData?.budget?.title);

      console.log(FINAL_PROMPT);

      const result = await chatSession.sendMessage(FINAL_PROMPT);
      console.log(result.response.text());
      const response = JSON.parse(result.response.text());
      setLoading(false);
      
      const docId = (Date.now()).toString();
      const result_ = await setDoc(doc(firestore, 'userItinerary', docId), {
        userEmail: user.email,
        itineraryData: response,
      })

      router.push('(tabs)/(itinerary)/');
      
    }

    return (
        <View
        className="bg-white flex-1 p-5 h-full items-start justify-start"
        >
            <Text
                className="text-2xl font-kbold"
            >Review your itinerary</Text>

            <View>
                <Text
                className="text-base font-ksemibold my-5">
                    Before generating your itinerary, please review your selection
                </Text>
            </View>
            <View className="flex-row mt-2 items-center h-16">
                <Text className="text-3xl items-center justify-center w-1/6">
                📍
                </Text>
                <View >
                    <Text className="font-ksemibold text-base text-gray-400">
                        Destination:
                    </Text>
                    <Text className="font-kregular text-base">
                    {itineraryData?.locationInfo?.name}
                </Text>
                </View>       
            </View>
            <View className="flex-row mt-2 items-center h-16">
                <Text className="text-3xl items-center justify-center w-1/6">
                🗓️
                </Text>
                <View >
                    <Text className="font-ksemibold text-base text-gray-400">
                        Travel Date:
                    </Text>
                    <Text className="font-kregular text-base">
                    {moment(itineraryData?.startDate).format('DD MMM')} - {moment(itineraryData?.endDate).format('DD MMM')} ({itineraryData?.totalNoOfDays} days)
                </Text>
                </View>       
            </View>
            <View className="flex-row mt-2 items-center h-16">
                <Text className="text-3xl items-center justify-center w-1/6">
                🧳
                </Text>
                <View >
                    <Text className="font-ksemibold text-base text-gray-400">
                        Who is Travelling:
                    </Text>
                    <Text className="font-kregular text-base">
                    {itineraryData?.traveler?.title}
                </Text>
                </View>
            </View>
            <View className="flex-row mt-2 items-center h-16">
                <Text className="text-3xl items-center justify-center w-1/6">
                💰
                </Text>
                <View >
                    <Text className="font-ksemibold text-base text-gray-400">
                        Budget:
                    </Text>
                    <Text className="font-kregular text-base">
                    {itineraryData?.budget?.title}
                </Text>
                </View>
            </View>  
            <View  className="w-full mt-5 items-center h-16">

                <Button
                title="Generate Itinerary"
                textColor="text-white"
                style="bg-primary w-4/5 mt-5"
                handlePress={GenerateAiItinerary}
                />  
            </View>
        </View>
    )
}

export default ReviewItinerary