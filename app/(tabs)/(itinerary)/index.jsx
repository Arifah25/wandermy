import { View, Text, Image, ScrollView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../../constants';
import { ItineraryCard } from '../../../components';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { auth, firestore } from '../../../configs/firebaseConfig';
import { useRouter } from 'expo-router';

const MyItinerary = () => {
  const router = useRouter();
  const [itinerary, setItinerary] = useState([]);
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      GetMyItinerary();
    }
  }, [user]);
  
  const GetMyItinerary = async () => {
    setLoading(true);
    setItinerary([]);
    
    try {
      const userEmail = user?.email;
      
      // Query itineraries where the user is the owner or a collaborator
      const q = query(
        collection(firestore, 'userItinerary'),
        where('collaborators', 'array-contains', userEmail),
      );
      const qOwner = query(
        collection(firestore, 'userItinerary'),
        where('userEmail', '==', userEmail)
      );
    
      const [collaboratorQuerySnapshot, ownerQuerySnapshot] = await Promise.all([
        getDocs(q),
        getDocs(qOwner),
      ]);
  
      const itineraries = [];
      
      collaboratorQuerySnapshot.forEach((doc) => {
        itineraries.push({ id: doc.id, ...doc.data() });
      });
  
      ownerQuerySnapshot.forEach((doc) => {
        itineraries.push({ id: doc.id, ...doc.data() });
      });
  
      // Remove duplicates in case the user is both owner and collaborator
      const uniqueItineraries = Array.from(
        new Map(itineraries.map(itinerary => [itinerary.id, itinerary])).values()
      );
  
      setItinerary(uniqueItineraries);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const New = () => {
    router.push("(tabs)/(itinerary)/(create-itinerary)/new");
  }

  const navigateDetails = (docId) => {
    router.push({
      pathname: '(tabs)/(itinerary)/detailsiti',
      params: { docId },
    });
  }

  const handleDelete = async (docId) => {
    setLoading(true);
    try {
      await deleteDoc(doc(firestore, 'userItinerary', docId));
      setItinerary(itinerary.filter(item => item.id !== docId));
    } catch (error) {
      console.error('Error deleting itinerary:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="bg-white h-full flex-1 p-5 justify-start">
      {loading && <ActivityIndicator size={'large'} color={'#000'} />}
      {itinerary?.length == 0 ? (
        <View>
          <Text className="text-black font-kregular text-2xl text-center">
            Let's Create {"\n"}Your First Itinerary
          </Text>
        </View>
      ) : (
        <View>
          <Text className="text-xl font-ksemibold text-black">
            Itineraries
          </Text>
          <View>
            <Image source={icons.search} className="w-7 h-7" />
          </View>
          <FlatList
            data={itinerary}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <ItineraryCard
                itinerary={item}
                name={item.itineraryData.tripDetails?.tripName}
                handlePress={() => navigateDetails(item.id)}
                handleDelete={() => handleDelete(item.id)}
              />
            )}
          />
        </View>
      )}
      <TouchableOpacity
        className="absolute bottom-5 right-5 bg-primary p-4 rounded-full shadow-sm shadow-black"
        onPress={New}
      >
        <Image source={icons.plus} tintColor="#fff" className="w-7 h-7" />
      </TouchableOpacity>
    </View>
  )
}

export default MyItinerary;