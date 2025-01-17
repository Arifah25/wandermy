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
import { Picker } from '@react-native-picker/picker';

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
  const [role, setRole] = useState('viewer');

  useEffect(() => {
      const fetchItinerary = async () => {
        setLoading(true);
        try {
          // Reference the Firestore document by its ID
          const docRef = doc(firestore, 'userItinerary', docId);
          const docSnap = await getDoc(docRef);
    
          if (docSnap.exists()) {
            const data = docSnap.data();
            setItineraryData(data.itineraryData || []); // Default to empty array if data is missing
            setDate(data);
            console.log('Document Data:', data);
          } else {
            console.log(`Document with ID ${docId} does not exist.`);
          }
        } catch (error) {
          console.error('Error fetching itinerary:', error);
        } finally {
          setLoading(false);
        }
      };
    
      if (docId) {
        fetchItinerary();
      }
    }, [docId, firestore]);

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
        collaborators: arrayUnion({ email, role }),
      });
      Alert.alert('Success', `${email} added as a ${role}!`);
      setEmail('');
      setRole('viewer'); // Reset role to default
      setUserExists(null);
    } catch (error) {
      console.error('Error adding collaborator:', error);
      Alert.alert('Error', 'An error occurred while adding the collaborator.');
    }
  };

  const handleRemoveCollaborator = (collaborator) => {
    Alert.alert(
      'Remove Collaborator',
      `Are you sure you want to remove ${collaborator.email} as a collaborator?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const docRef = doc(firestore, 'userItinerary', docId);
  
              // Use arrayRemove to remove the exact object (email + role)
              await updateDoc(docRef, {
                collaborators: arrayRemove(collaborator),
              });
  
              Alert.alert('Success', `${collaborator.email} removed as a collaborator.`);
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
        console.log("Fetching Itinerary Data:", itineraryData);
        
        if (itineraryData?.days) {
          const newPlaceDetails = {};
          
          itineraryData.days.forEach((day) => {
            day.places.forEach((item) => {
              const placeRef = ref(db, `places/${item.placeID}`);
              onValue(placeRef, (snapshot) => {
                const details = snapshot.val();
                if (details) {
                  newPlaceDetails[item.placeID] = details;
                  setPlaceDetails((prevDetails) => ({ ...prevDetails, [item.placeID]: details }));
                }
              });
            });
          });
          // console.log("Updated Place Details:", newPlaceDetails);
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
    // console.log("Latitude:", latitude);
    // console.log("Longitude:", longitude);
    // console.log("Destination Name:", destinationName); // Check if it's undefined
  
    if (!latitude || !longitude) {
      Alert.alert("Error", "Invalid location coordinates.");
      return;
    }
  
    if (!destinationName) {
      destinationName = "Destination"; // Fallback name if undefined
    }
  
    const latLong = `${latitude},${longitude}`;
  
    // Corrected Google Maps URL
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationName)}&destination_place_id=${latLong}&travelmode=driving`;
  
    // Apple Maps URL
    const appleMapsUrl = `http://maps.apple.com/?daddr=${latLong}&q=${encodeURIComponent(destinationName)}&dirflg=d`;
  
    // Waze URL
    const wazeUrl = latitude && longitude
    ? `https://waze.com/ul?ll=${latLong}&navigate=yes`
    : `https://waze.com/ul?q=${encodeURIComponent(destinationName)}&navigate=yes`;
  
    // Present options for preferred maps
    Alert.alert(
      "Choose Navigation App",
      "Select your preferred maps application:",
      [
        {
          text: "Google Maps",
          onPress: () => {
            console.log("Opening Google Maps:", googleMapsUrl);
            Linking.openURL(googleMapsUrl);
          },
        },
        {
          text: "Apple Maps",
          onPress: () => Linking.openURL(appleMapsUrl),
        },
        {
          text: "Waze",
          onPress: () => Linking.openURL(wazeUrl),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };
  
  const findNearestHotels = async (latitude, longitude) => {
    try {
      const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY;
      // Make API request to Google Places
      const radius = 5000; // 5 km
      const type = 'hotel';
  
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
  
      // Handle results
      if (data.results && data.results.length > 0) {
        const nearestPlaces = data.results.slice(1, 4); // Take the top 3 results
        const placesInfo = nearestPlaces.map(place => {
          return `Name: ${place.name}\nAddress: ${place.vicinity}\nRating: ${place.rating || 'N/A'}`;
        }).join('\n\n');
  
        // Show alert with the nearest places info
        Alert.alert(
          'Nearest Hotel Recommendations',
          placesInfo,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('No Nearby Places', 'No hotels found within 5 km.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching nearby places.');
      console.error(error);
    }
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
    // Since we don't have transport data in new structure, return null or placeholder
    return null;
    // Or show placeholder:
    // return (
    //   <View>
    //     <Text className="text-lg font-kregular mt-3">🚌 Transport options will be added soon</Text>
    //   </View>
    // );
  }, [itineraryData]);

  const renderHotelRecommendation = useMemo(() => {
    // Since we don't have transport data in new structure, return null or placeholder
    return null;
    // Or show placeholder:
    // return (
    //   <View>
    //     <Text className="text-lg font-kregular mt-3">🚌 Transport options will be added soon</Text>
    //   </View>
    // );
  }, [itineraryData]);

  const renderItinerary = useMemo(() => {
    if (!itineraryData?.days) return null;

    return (
      <View>
        <Text className="text-lg font-kregular mt-3">📑 Itinerary</Text>
        {itineraryData.days.map((day, index) => (
          <View key={index}>
            <Text className="text-lg font-kregular mb-2">Day {index + 1}:</Text>
            {day.places.map((item, itemIndex) => (
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
                    <Text className="font-kregular text-lg">{item.name}</Text>
                      <Text className="font-kregular text-sm">⏱️ {item.visitTime || 'Flexible'}</Text>
                      <Text className="font-kregular text-sm">⏳ {item.duration ? `${item.duration} mins` : 'Flexible'}</Text>
                      <Text className="font-kregular text-sm">📍 {item.category}</Text>
                  </View>
                </View>                
                <View className="ml-2 w-full items-start">
                  
                  <View className="flex-row justify-between w-full mt-2 p-1">
                    <TouchableOpacity className="flex-row bg-blue-500 p-2 rounded-full items-center mr-2"
                      onPress={() => findNearestMosque(placeDetails[item.placeID].latitude, placeDetails[item.placeID].longitude)}
                      >
                      <FontAwesome6 name="mosque" size={18} color="white" />
                      <Text className="mx-2 font-kregular text-white text-sm">Nearest Mosque</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row bg-blue-500 px-3 rounded-full items-center"
                      onPress={() => navigateToLocation(placeDetails[item.placeID].latitude, placeDetails[item.placeID].longitude, item.name )}
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
          <Text className="text-2xl font-ksemibold">{date.tripDetails.tripName}</Text>
          <Text className="text-base font-kregular">📍 {date.tripDetails.destination}</Text>
          <Text className="text-base font-kregular">📅 {date.startDate} - {date.endDate} ({date.tripDetails.totalDays} days {date.tripDetails.totalNights} nights)</Text>
          <View className="flex-row justify-between">
            <Text className="text-base font-kregular">💵 {date.tripDetails.budget} </Text>
            <Text className="text-base font-kregular">🧍🏽‍♂️ {date.tripDetails.traveler} </Text>
          </View>
        </View>
        <View className="w-full items-center">
          <Text className="font-kregular text-xl">Hotels</Text>
          <TouchableOpacity onPress={findNearestHotels(date.info.coordinates.lat, date.info.coordinates.lng )} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <Text style={{ color: '#007bff', marginLeft: 5 }}>Hotel</Text>
          </TouchableOpacity>
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
                keyExtractor={(item) => item.email}
                renderItem={({ item }) => (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={{ fontSize: 16 }}>{item.email} ({item.role})</Text>
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
              <>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 5,
                    padding: 10,
                  }}
                  placeholder="Enter email"
                  value={email}
                  onChangeText={(text) => setEmail(text)}
                />
                {Platform.OS === 'ios'? (
                  <Picker
                  selectedValue={role}
                  onValueChange={(itemValue) => setRole(itemValue)}
                  style={{ marginVertical: -24 }}
                >
                  <Picker.Item label="Viewerr" value="viewer"/>
                  <Picker.Item label="Editor" value="editor" />
                </Picker>
                ) : (
                  <Picker
                  selectedValue={role}
                  onValueChange={(itemValue) => setRole(itemValue)}
                  
                >
                  <Picker.Item label="Viewer" value="viewer"/>
                  <Picker.Item label="Editor" value="editor" />
                </Picker>
                )
                }
                
                {email.length > 0 && (
                  <Text style={{ color: userExists ? 'green' : 'red', marginBottom: 10 }}>
                    {userExists ? 'User exists' : 'User not found'}
                  </Text>
                )}
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
                </TouchableOpacity>
              </>}
              
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