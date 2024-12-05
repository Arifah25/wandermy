import { View, Text, Image, ScrollView, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TouchableOpacity } from 'react-native'
import { icons } from '../../../constants'
import { ItineraryCard } from '../../../components'
import { useRouter } from 'expo-router'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { auth, firestore } from '../../../configs/firebaseConfig'
import { ActivityIndicator } from 'react-native'

const MyItinerary = () => {
  const router = useRouter();
  const [itinerary, setItinerary] = useState([]);
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    user&&GetMyItinerary();
  }, [user]);

  const GetMyItinerary = async() => {   
    setLoading(true);
    setItinerary([]); 
    const q = query(collection(firestore, 'userItinerary'), where('userEmail', '==', user?.email)); 
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots.
      // console.log(doc.id, " => ", doc.data());
      setItinerary(prev => [...prev, doc.data()]);
    });
    setLoading(false);
    console.log(itinerary);
  }

  const New = () => {
    router.push("(tabs)/(itinerary)/(create-itinerary)/new");
  }

  const navigateDetails = (itinerary) => {
    router.push("(tabs)/(itinerary)/detailsiti", {itinerary});
  }

  return (
    <View
    className="bg-white h-full flex-1 p-5 justify-start"
    >
      {loading&&<ActivityIndicator size={'large'} color={'#000'}/> }
       {itinerary?.length==0?
       (<View>
        <Text
        className="text-black font-kregular text-2xl text-center">
          Let's Create {"\n"}Your First Itinerary
        </Text>
       </View>
       ):(<View>
        <Text className="text-xl font-kregular text-black">
          Itineraries
        </Text>
        <FlatList
        data={itinerary}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <ItineraryCard 
          itinerary={item}
          name={item.itineraryData.travelPlanName}
          handlePress={navigateDetails}
          />
        )}
        />
       </View>)
       }
       <TouchableOpacity
        className=" absolute bottom-5 right-5 bg-primary p-4 rounded-full shadow-sm shadow-black"
        onPress={New}
      >
        <Image source={icons.plus} tintColor="#fff" className="w-7 h-7"/>
      </TouchableOpacity> 
    </View>
  )
}

export default MyItinerary