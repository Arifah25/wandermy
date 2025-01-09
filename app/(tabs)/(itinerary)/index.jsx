import { View, Text, Image, ScrollView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../../constants';
import { ItineraryCard } from '../../../components';
import { collection, getDocs, query, where, deleteDoc, doc, getDoc, some } from 'firebase/firestore';
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
      const userEmail = user.email; // Replace with the logged-in user's email
  
      // Fetch all itineraries from Firestore
      const querySnapshot = await getDocs(collection(firestore, 'userItinerary'));
  
      const itineraries = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Ensure `collaborators` is always an array
        const collaborators = Array.isArray(data.collaborators) ? data.collaborators : [];
  
        const isOwner = data.userEmail === userEmail;
        const isCollaborator = collaborators.some((collab) => collab.email === userEmail);
  
        // Add the itinerary if the user is either the owner or a collaborator
        if (isOwner || isCollaborator) {
          itineraries.push({ id: doc.id, ...data });
        }
      });
  
      // Set the filtered itineraries
      setItinerary(itineraries);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
    } finally {
      setLoading(false);
    }
  };

  const New = () => {
    router.push("(tabs)/(itinerary)/(create-itinerary)/new");
  }

  const navigateDetails = (docId, startDate, endDate) => {
    router.push({
      pathname: '(tabs)/(itinerary)/detailsiti',
      params: { docId, startDate, endDate },
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
  };

  const getUserRole = async (docId, userEmail) => {
    try {
      // Reference the specific itinerary document by docId
      const docRef = doc(firestore, 'userItinerary', docId);
      const docSnapshot = await getDoc(docRef);
  
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        
        // Ensure collaborators is an array
        const collaborators = Array.isArray(data.collaborators) ? data.collaborators : [];
  
        // Find the collaborator with the matching email
        const collaborator = collaborators.find(collab => collab.email === userEmail);
  
        if (collaborator) {
          return collaborator.role; // Return the role of the user
        } else if (data.userEmail === userEmail) {
          return 'owner'; // If the user is the owner, return 'owner'
        } else {
          return null; // User not found as owner or collaborator
        }
      } else {
        console.error('Document does not exist.');
        return null;
      }
    } catch (error) {
      console.error('Error retrieving user role:', error);
      return null;
    }
  };
  

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
                docId={item.id}
                rolePromise = {getUserRole(item.id, user.email)}
                itinerary={item}
                name={item.itineraryData.tripDetails?.tripName}
                handlePress={() => navigateDetails(item.id, item.startDate, item.endDate)}
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