import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { CreateItineraryContext } from '../../../../context/CreateItineraryContext';
import { AI_PROMPT } from '../../../../constants/option';
import { Button } from '../../../../components';
import { chatSession } from '../../../../configs/AImodule';
import { useRouter } from 'expo-router';
import { setDoc, doc } from 'firebase/firestore';
import { auth, firestore } from '../../../../configs/firebaseConfig';

const GenerateItinerary = () => {
    const {itineraryData, setItineraryData} = useContext(CreateItineraryContext);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
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

      router.push('(tabs)/(itinerary)/itinerary');
      
    }

  return (
    <View
    className="bg-white flex-1 p-5 h-full items-start justify-start"
    >
      <Text>GenerateItinerary</Text>
      <Button 
      title="Generate Itinerary" 
      onPress={GenerateAiItinerary} 
      style="bg-primary w-full mt-5"
      textColor="text-white"
      />
    </View>
  )
}

export default GenerateItinerary 