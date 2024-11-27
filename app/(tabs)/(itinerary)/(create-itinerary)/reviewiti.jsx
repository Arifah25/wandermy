import { View, Text } from 'react-native'
import React, { useContext } from 'react'
import { CreateItineraryContext } from '../../../../context/CreateItineraryContext'
import moment from 'moment';
import { Button } from '../../../../components';
import { useRouter } from 'expo-router';

const ReviewItinerary = () => {

    const router = useRouter();
    const {itineraryData, setItineraryData} = useContext(CreateItineraryContext);

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
                handlePress={() => router.push('/(create-itinerary)/generate')}
                />  
            </View>
        </View>
    )
}

export default ReviewItinerary