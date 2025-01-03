import { View, Text, Image, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Linking, TextInput, Platform, Alert, Modal, StyleSheet, } from 'react-native';
import React, { useEffect, useState, useMemo } from 'react';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { auth, database, firestore } from '../../../configs/firebaseConfig';
import { icons } from '../../../constants';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { get, getDatabase, onValue, ref } from 'firebase/database';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const ItineraryDetails = () => {
  const route = useRoute();
  const { docId } = route.params;
  const [itineraryData, setItineraryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(null);
  const router = useRouter();
  const [collaborators, setCollaborators] = useState([]);
  const [placeDetails, setPlaceDetails] = useState({});
  const userEmail = auth.currentUser.email;

  useEffect(() => {
    const fetchItinerary = async () => {
      setLoading(true);
      try {
        const docRef = doc(collection(firestore, 'userItinerary'), docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setItineraryData(docSnap.data().itineraryData);
          setDate(docSnap.data());
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching itinerary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [docId]);

  // const ManageCollaborators = ({ itineraryDocId, owner, collaborators, userEmail }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [newCollaborator, setNewCollaborator] = useState("");
    const [email, setEmail] = useState('');
    // const [loading, setLoading] = useState(false);
  
    const [userExists, setUserExists] = useState(null);  

  // Function to check if user exists
  useEffect(() => {
    const checkUserExists = async () => {
      if (!email) return;
      try {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const users = snapshot.val();
          const exists = Object.values(users).some((user) => user.email === email);
          setUserExists(exists);
        } else {
          setUserExists(false);
        }
      } catch (error) {
        console.error('Error checking user existence:', error);
        setUserExists(false);
      }
    };
    checkUserExists();
  }, [email]); 

  useEffect(() => {
    const docRef = doc(firestore, 'userItinerary', docId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCollaborators(data.collaborators || []);
      }
    });

    return () => unsubscribe();
  }, [docId]);

  // Function to add collaborator
  const handleAddCollaborator = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email.');
      return;
    }

    if (!userExists) {
      Alert.alert('Error', 'User does not exist.');
      return;
    }

    try {
      const docRef = doc(firestore, 'userItinerary', docId);
      await updateDoc(docRef, {
        collaborators: arrayUnion(email),
      });
      Alert.alert('Success', `${email} added as a collaborator!`);
      setEmail('');
      setUserExists(null);
    } catch (error) {
      console.error('Error adding collaborator:', error);
      Alert.alert('Error', 'An error occurred while adding the collaborator.');
    }
  };

  // Function to remove collaborator
  const handleRemoveCollaborator = (email) => {
    Alert.alert(
      'Remove Collaborator',
      `Are you sure you want to remove ${email} as a collaborator?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const docRef = doc(firestore, 'userItinerary', docId);
              await updateDoc(docRef, {
                collaborators: arrayRemove(email),
              });
              Alert.alert('Success', `${email} removed as a collaborator.`);
            } catch (error) {
              console.error('Error removing collaborator:', error);
              Alert.alert('Error', 'Failed to remove collaborator. Please try again.');
            }
          },
        },
      ]
    );
  };
    

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      const db = getDatabase();
      const newPlaceDetails = {};

      if (itineraryData) {
        Object.keys(itineraryData.itinerary).forEach((day) => {
          itineraryData.itinerary[day].forEach((item) => {
            const placeRef = ref(db, `places/${item.placeID}`);
            onValue(placeRef, (snapshot) => {
              const details = snapshot.val();
              newPlaceDetails[item.placeID] = details;
              setPlaceDetails((prevDetails) => ({ ...prevDetails, [item.placeID]: details }));
            });
          });
        });
      }
    };

    fetchPlaceDetails();
  }, [itineraryData]);

  const redirectToMaps = (latitude, longitude, destinationName) => {
    const latLong = `${latitude},${longitude}`;
  
   
  
    // Decide which app to open
    if (Platform.OS === 'ios') {
      // Check for Google Maps or Waze on iOS
      Linking.canOpenURL(wazeUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(wazeUrl);
          } else {
            Linking.openURL(appleMapsUrl); // Fallback to Apple Maps
          }
        })
        .catch(() => {
          Alert.alert('Error', 'Failed to open the map.');
        });
    } else {
      // For Android, prioritize Waze or Google Maps
      Linking.canOpenURL(wazeUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(wazeUrl);
          } else {
            Linking.openURL(googleMapsUrl); // Fallback to Google Maps
          }
        })
        .catch(() => {
          Alert.alert('Error', 'Failed to open the map.');
        });
    }
  };

  const navigateToLocation = (latitude, longitude, destinationName) => {
    const latLong = `${latitude},${longitude}`;

     // Google Maps URL
     const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationName)}&destination_place_id=${latLong}&travelmode=driving`;
  
     // Apple Maps URL (iOS only)
     const appleMapsUrl = `http://maps.apple.com/?daddr=${latLong}&q=${encodeURIComponent(destinationName)}&dirflg=d`;
   
     // Waze URL
     const wazeUrl = `https://waze.com/ul?ll=${latLong}&navigate=yes&q=${encodeURIComponent(destinationName)}`;
    // Present options for preferred maps
    Alert.alert(
      'Choose Navigation App',
      'Select your preferred maps application:',
      [
        {
          text: 'Google Maps',
          onPress: () => Linking.openURL(googleMapsUrl),
        },
        {
          text: 'Apple Maps',
          onPress: () => Linking.openURL(appleMapsUrl),
        },
        {
          text: 'Waze',
          onPress: () => Linking.openURL(wazeUrl),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }; 

const findNearestMosque = async (latitude, longitude) => {
  
  try {
    const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY;
    // Make API request to Google Places
    const radius = 5000; // 5 km
    const type = 'mosque'; // or 'place_of_worship'

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    // Handle results
    if (data.results && data.results.length > 0) {
      const nearestPlace = data.results[0]; // Take the first result
      const { name, vicinity } = nearestPlace;

      // Show alert with the nearest place info
      Alert.alert(
        'Nearest Prayer Place Found',
        `Name: ${name}\nAddress: ${vicinity}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('No Nearby Places', 'No masjid, surau, or prayer rooms found within 5 km.');
    }
  } catch (error) {
    Alert.alert('Error', 'An error occurred while fetching nearby places.');
    console.error(error);
  }
};


  const renderTransportRecommendation = useMemo(() => {
    if (!itineraryData) return null;
    return (
      <View>
        <Text className="text-lg font-kregular mt-3">🚌 Transport Recommendation:</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {itineraryData.publicTransport.map((item, index) => (
            <View key={index} className="border border-secondary p-2 mx-2 rounded-lg mt-2" style={{ width: 200 }}>
              <Text className="font-ksemibold">{item.mode}</Text>
              <Text className="font-kregular">{item.route}</Text>
              <Text className="font-kregular">Operator: {item.operator}</Text>
              <Text className="font-kregular">Price: {item.estimatedPrice.min} - {item.estimatedPrice.max}</Text>
              {/* <View className="absolute right-2 bottom-2">
                <TouchableOpacity>
                  <Text className="font-kregular text-blue-500">Book Now</Text>
                </TouchableOpacity>
              </View> */}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }, [itineraryData]);

  const renderHotelRecommendation = useMemo(() => {
    if (!itineraryData) return null;
    return (
      <View>
        <Text className="text-lg font-kregular mt-3">🏨 Hotel Recommendation:</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {itineraryData.accommodation.map((item, index) => (
            <View key={index} className="mx-3 border border-secondary rounded-lg mt-2" style={{ width: 200 }}>
              {/* <View className="items-center bg-secondary rounded-lg">
                <Image source={icons.wandermy} style={{ width: 100, height: 100 }} />
              </View> */}
              <View className="rounded-lg px-2 mt-2">
                <Text className="font-ksemibold">{item.name}</Text>
                <Text className="font-kregular">{item.location}</Text>
                <Text className="font-kregular">{item.priceRange.min} - {item.priceRange.max}</Text>
                <Text className="font-kregular text-right">⭐ {item.rating}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }, [itineraryData]);

  const renderItinerary = useMemo(() => {
    if (!itineraryData) return null;

    const sortedDays = Object.keys(itineraryData.itinerary).sort((a, b) => {
      const dayA = parseInt(a.replace('day', ''), 10);
      const dayB = parseInt(b.replace('day', ''), 10);
      return dayA - dayB;
    });

    return (
      <View>
        <Text className="text-lg font-kregular mt-3">📑 Itinerary</Text>
        {sortedDays.map((day, index) => (
          <View key={index}>
            <Text className="text-lg font-kregular mb-2">Day {index + 1}:</Text>
            {itineraryData.itinerary[day].map((item, itemIndex) => (
              <TouchableOpacity key={itemIndex} className="rounded-lg border mb-5 p-2 items-center"
                onPress={() => handlePlacePress(placeDetails[item.placeID])}>
                <View className="items-start flex-row w-full">
                  <View className="mr-2 rounded-lg items-center w-1/2 h-32">
                    {placeDetails[item.placeID]?.poster ? (
                      <Image source={{ uri: placeDetails[item.placeID].poster[0] }}
                        resizeMode='cover'
                        className="rounded-lg w-full h-full"
                      />
                    ) : (
                      <Image source={icons.wandermy} style={{ width: 100, height: 100 }} />
                    )}
                  </View>
                  <View className="w-[45%] items-start ml-2 ">
                    <Text className="font-kregular text-lg">{item.place}</Text>
                    <Text className="font-kregular text-sm">⏱️ {item.time}</Text>
                    <Text className="font-kregular text-sm">💸 {item.budget}</Text>
                  </View>
                </View>                
                <View className="ml-2 w-full items-start">
                  
                  <View className="flex-row justify-between w-full mt-2 p-1">
                    <TouchableOpacity className="flex-row bg-blue-500 p-2 rounded-full items-center mr-2"
                      onPress={() => findNearestMosque(placeDetails[item.placeID].latitude, placeDetails[item.placeID].longitude, item.place)}
                      >
                      <FontAwesome6 name="mosque" size={18} color="white" />
                      <Text className="mx-2 font-kregular text-white text-sm">Nearest Mosque</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row bg-blue-500 px-3 rounded-full items-center"
                      onPress={() => navigateToLocation(placeDetails[item.placeID].latitude, placeDetails[item.placeID].longitude)}
                    >
                      <FontAwesome name="map-marker" size={24} color="white" />
                      <Text className="mx-2 font-kregular text-white text-sm">Get Directions</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  }, [itineraryData, placeDetails]);

  const handlePlacePress = (place) => {
    router.push({
      pathname: '(tabs)/(itinerary)/detailsplaces',
      params: { ...place },
    });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  if (!itineraryData) {
    return <Text>No Itinerary Data</Text>;
  }

  const handleBack = () => {
    router.replace('(tabs)/(itinerary)/');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center mx-6 justify-between">
        <TouchableOpacity onPress={handleBack} style={{ marginTop: 5 }}>
          <Image source={icons.left} style={{ width: 24, height: 24, tintColor: '#000' }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ marginTop: 5 }}>
          <Feather name="share" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View className="px-5 w-full">
        <View className="gap-x-4 p-2">
          <Text className="text-2xl font-ksemibold">{itineraryData.tripDetails.tripName}</Text>
          <Text className="text-base font-kregular">📍 {itineraryData.tripDetails.destination}</Text>
          <Text className="text-base font-kregular">📅 {date.startDate} - {date.endDate} ({itineraryData.tripDetails.totalDays} days {itineraryData.tripDetails.totalNights} nights)</Text>
          <View className="flex-row justify-between">
            <Text className="text-base font-kregular">💵 {itineraryData.tripDetails.budget} </Text>
            <Text className="text-base font-kregular">🧍🏽‍♂️ {itineraryData.tripDetails.traveler} </Text>
          </View>
        </View>
        <ScrollView className="mb-7 flex h-4/5">
          {renderTransportRecommendation}
          {renderHotelRecommendation}
          {renderItinerary}
          <Text></Text>
        </ScrollView>
        {/* Collaborator Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '90%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Collaborators</Text>
            
            {/* Collaborator List */}
            
              <FlatList
              data={collaborators}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 16 }}>{item}</Text>
                  {userEmail === date.userEmail && 
                  <TouchableOpacity onPress={() => handleRemoveCollaborator(item)}>
                    <Feather name="x-circle" size={24} color="red" />
                  </TouchableOpacity>}
                </View>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: 'gray', marginVertical: 10 }}>No collaborators yet.</Text>}
            />
            
            
            {/* Add Collaborator */}
            {userEmail === date.userEmail && 
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 5,
                padding: 10,
                marginBottom: 10,
              }}
              placeholder="Enter email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              // onBlur={() => checkUserExists(email)}
            />}
            {email.length > 0 && (
              <Text style={{ color: userExists ? 'green' : 'red', marginBottom: 10 }}>
                {userExists ? 'User exists' : 'User not found'}
              </Text>
            )}
            
            {userEmail === date.userEmail && 
            <TouchableOpacity
              onPress={handleAddCollaborator}
              style={{
                backgroundColor: '#007bff',
                padding: 10,
                borderRadius: 5,
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Collaborator</Text>
            </TouchableOpacity>}

            {/* Close Button */}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ alignItems: 'center' }}>
              <Text style={{ color: '#007bff', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    color: '#FF0000',
    fontSize: 16,
  },
});

export default ItineraryDetails;