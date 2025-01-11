import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Image, ScrollView, TouchableOpacity, Modal, Linking, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { DetailTab, Poster, Button } from '../../../components';
import { images, icons } from '../../../constants';
import { getDatabase, ref, onValue, set, remove, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const HomeDetails = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [event, setEvent] = useState({});
  const [reviews, setReviews] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [hour, setOperatingHours] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const route = useRoute();
  const router = useRouter();
  const [placeData, setPlaceData] = useState({
    price_or_menu: [],
  });

  const { placeID, name, poster, address, websiteLink, category, contactNum, tags, description, feeAmount, status, admissionType } = route.params;
  const auth = getAuth();
  const db = getDatabase();
  const orderedDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const toggleModalVisibility = () => {
    setIsModalVisible(!isModalVisible);
  };


  const handleDelete = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this place from the database?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Deletion canceled'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deletePlace(placeID, category),
          style: 'destructive', // Optional: gives a red color to the button on iOS
        },
      ],
      { cancelable: true } // Allows the alert to be dismissed by tapping outside
    );
  };

  const deletePlace = (placeID, category) => {
    const db = getDatabase();
  
    // Construct the path to the place using the category and placeID
    const placeRef = ref(db, `places/${placeID}`);
  
    // Perform the deletion
    remove(placeRef)
      .then(() => {
        console.log(`Place with ID ${placeID} in category ${category} deleted successfully.`);
        router.back();
      })
      .catch((error) => {
        console.error("Error deleting place:", error);
      });
  };

  const handleEdit = (placeID, category) => {  
    if (category === 'attraction') {
      router.push(`/(admin)/(home)/(edit)/editattraction?placeID=${placeID}`);
      console.log('boleh tekan edit');
    } else if (category === 'dining') {
      router.push(`/(admin)/(home)/(edit)/editdining?placeID=${placeID}`);
    } else if (category === 'event') {
      router.push(`/(admin)/(home)/(edit)/editevent?placeID=${placeID}`);
    }
  };

  //fetch data from db
  useEffect(() => {
    if (placeID) {
      const userRef = ref(db, `places/${placeID}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("Fetched data:", data); 
          setPlaceData(data);
          // console.log("Poster Images:", data.poster); // Log poster images          // console.log("Price Images:", data.price_or_menu); // Log price images
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });
    }
  }, [placeID]);
  
  // Render facilities
  const renderFacilities = () => {
    const { facilities, halalStatus } = placeData;

    if ((!facilities || facilities.length === 0) && !(category === 'dining' && halalStatus === 'halal')) {
      return null; // Skip rendering if there are no facilities or halalStatus
    }

    return (
      <View className="flex-row justify-start mb-3">
        {/* <Text className="text-lg font-ksemibold mr-2">Facilities:</Text> */}
        {/* Halal Icon for Dining Category */}
        {category === 'dining' && halalStatus === 'Halal' && (
          <Image source={icons.halal} style={{ width: 40, height: 40, marginRight: 20 }} />
        )}
        {facilities.includes('Surau') && (
          <Image source={icons.surau} style={{ width: 40, height: 40, marginRight: 20 }} />
        )}
        {facilities.includes('WiFi') && (
          <Image source={icons.wifi} style={{ width: 40, height: 40, marginRight: 20 }} />
        )}
        {facilities.includes('Toilet') && (
          <Image source={icons.toilet} style={{ width: 40, height: 40, marginRight: 20 }} />
        )}
        {facilities.includes('Parking') && (
          <Image source={icons.parking} style={{ width: 40, height: 40, marginRight: 20 }} />
        )}
      </View>
    );
  };
  
  // Fetch operating hours
  useEffect(() => {
    const hourRef = ref(db, `operatingHours/${placeID}`);
  
  onValue(hourRef, (snapshot) => {
    const data = snapshot.val();

    // Initialize an empty array to hold the sorted hours
    const sortedHours = [];

    // Iterate over the orderedDays array and pick the corresponding data from the snapshot
    orderedDays.forEach((day) => {
      if (data && data[day]) {
        sortedHours.push({
          dayOfWeek: day,
          ...data[day],
        });
      } else {
        sortedHours.push({
          dayOfWeek: day,
          isOpen: false,
          openingTime: null,
          closingTime: null,
        });
      }
    });

    setOperatingHours(sortedHours); // Now the operating hours are in the correct order
  });
}, [placeID]);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const eventRef = ref(db, `event/${placeID}`);
      const snapshot = await get(eventRef);
      const eventData = snapshot.exists() ? snapshot.val() : {};
      setEvent(eventData);
      setLoading(false);
    };

    if (category === 'event' && status == 'approved') fetchEvent();
  }, [placeID, category]);


  // Fetch reviews and user profiles
useEffect(() => {
  const fetchReviewsAndProfiles = async () => {
    const refToUse = ref(db, `reviews/${placeID}`);
    onValue(refToUse, (snapshot) => {
      const data = snapshot.val();
      const reviewList = data ? Object.values(data) : [];
      setReviews(reviewList);  // Set the fetched reviews in state

      // Now fetch user profiles for each review
      const fetchUserProfiles = async (reviewList) => {
        const profiles = {};  // Store fetched profiles here
        for (const review of reviewList) {
          const userId = review.user;  // Use review.user to get the userId
          if (!profiles[userId]) {     // Check if this user's profile has not been fetched yet
            const userRef = ref(db, `users/${userId}`);  // Correct path to user data
            const userSnapshot = await get(userRef);     // Fetch user data from Firebase
            profiles[userId] = userSnapshot.val();       // Store the fetched profile data
          }
        }
        setUserProfiles(profiles);  // Set the user profiles in state
      };

      fetchUserProfiles(reviewList);  // Fetch profiles after getting the reviews
      setLoading(false);
    });
  };

  fetchReviewsAndProfiles();
}, [placeID]);  // Dependency on placeID

useEffect(() => {
  if (poster) {
    Image.prefetch(poster);
  }
  if (placeData.price_or_menu && placeData.price_or_menu.length > 0) {
    placeData.price_or_menu.forEach((imageUri) => {
      Image.prefetch(imageUri);
    });
  }
}, [poster, placeData.price_or_menu]);

  // Render details
  const renderDetails = () => (
    <View className="mx-2 ">
      {category !== 'event' && (
        <View className="mb-3 rounded-md bg-secondary">
          <TouchableOpacity
            onPress={() => Linking.openURL(websiteLink)}
            className="h-9 items-center justify-center"
          >
            <Text className="text-base font-kregular">Website</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View className="items-center mx-7 justify-center">
        {category === 'event'? (
          <View className="w-full items-start mt-3">
            {renderFacilities()}
            <View >
              <Text className="text-lg font-ksemibold">Description :</Text>
              <Text className="font-kregular">{description}</Text>
            </View>

            <View className="w-full items-start mt-3">
              <Text className="text-lg font-ksemibold">Event date & time :</Text>
              <Text className="font-kregular">
                {event.startDate} - {event.endDate}{"\n"}{event.startTime} - {event.endTime}
              </Text>
            </View>

            <View className="w-full items-start">
              <Text className="text-lg font-ksemibold">Contact Number :</Text>
              <Text className="font-kregular">{contactNum}</Text>
            </View>

            <View className="w-full items-start mt-3">
              <Text className="text-lg font-ksemibold">Admission Fee:</Text>
              {admissionType === 'free' ? (
                <Text className="font-kregular mt-2">Free Entry</Text>
              ) : (
                <Text className="font-kregular mt-2">{feeAmount}</Text>
              )}
            </View>
            {placeData.price_or_menu && placeData.price_or_menu.length > 0 ? (
              <View className="w-full items-start mt-3">
                <Text className="text-lg font-ksemibold mb-3">More Details :</Text>
                <View className="w-full">
                  {placeData.price_or_menu.map((imageUri, index) => (
                    <Image
                    key={index}
                    source={{
                      uri: imageUri,
                      cache: 'default', // Options: 'default', 'reload', 'force-cache', 'only-if-cached'
                    }}
                    style={{
                      width: '100%',
                      aspectRatio: 1,
                      borderRadius: 10,
                      backgroundColor: '#E5E5E5', // Optional fallback background
                    }}
                    resizeMode="contain"
                  />
                  // <Image
                  //   key={index}
                  //   source={{ uri: imageUri }}
                  //   style={{
                  //     width: '100%', // Make it occupy full width
                  //     aspectRatio: 1, // Maintain a 1:1 aspect ratio (square images)
                  //     marginBottom: 10, // Add spacing between images
                  //   }}
                  //   resizeMode="contain"
                  // />
                  ))}
                </View>
              </View>
            ) : null}
            <View className="w-full items-start my-3">
              <Text className="text-lg font-ksemibold">Tags :</Text>
              <Text className=" font-kregular">{tags}</Text>
            </View>
          </View>   
                 
        ):category === 'attraction' ? (
          <View className="w-full items-start mt-3">
            {renderFacilities()}
            <View className="w-full items-start">
              <Text className="text-lg font-ksemibold">Address :</Text>
              <Text className="font-kregular">{address}</Text>
            </View>

            <View className="w-full items-start mt-3">
              <Text className="text-lg font-ksemibold">Operating Hours :</Text>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                <View key={index} className="flex-row">
                  <Text className="w-1/3 font-kregular">{day}</Text>
                  {hour[index]?.isOpen ? (
                    <Text className="w-2/3 font-kregular text-right">
                      {hour[index].openingTime} - {hour[index].closingTime}
                    </Text>
                  ) : (
                    <Text className="text-right w-[30%] font-kregular">Closed</Text>
                  )}
                </View>
              ))}
            </View>

            <View className="w-full items-start">
              <Text className="text-lg font-ksemibold">Contact Number :</Text>
              <Text className="font-kregular">{contactNum}</Text>
            </View>

            <View className="w-full items-start mt-3">
              <Text className="text-lg font-ksemibold">Admission Fee:</Text>
              {admissionType === 'free' ? (
                <Text className="font-kregular mt-2">Free Entry</Text>
              ) : placeData.price_or_menu && placeData.price_or_menu.length > 0 ? (
                <View className="w-full">
                  {placeData.price_or_menu.map((imageUri, index) => (
                    <Image
                    key={index}
                    source={{ uri: imageUri }}
                    style={{
                      width: '100%', // Make it occupy full width
                      aspectRatio: 1, // Maintain a 1:1 aspect ratio (square images)
                      marginBottom: 10, // Add spacing between images
                    }}
                    resizeMode="contain"
                  />
                  ))}
                </View>
              ) : (
                <Text className="font-kregular mt-2">No price information available.</Text>
              )}
            </View>
            <View className="w-full items-start my-3">
              <Text className="text-lg font-ksemibold">Tags :</Text>
              <Text className=" font-kregular">{tags}</Text>
            </View>
          </View>

        ) : category === 'dining' ? (
          <View className="w-full items-start mt-3">
            {renderFacilities()}
            <View className="w-full items-start">
              <Text className="text-lg font-ksemibold">Address :</Text>
              <Text className="font-kregular">{address}</Text>
            </View>

            <View className="w-full items-start mt-3">
              <Text className="text-lg font-ksemibold">Operating Hours :</Text>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                <View key={index} className="flex-row">
                  <Text className="w-1/3 font-kregular">{day}</Text>
                  {hour[index]?.isOpen ? (
                    <Text className="w-2/3 font-kregular text-right">
                      {hour[index].openingTime} - {hour[index].closingTime}
                    </Text>
                  ) : (
                    <Text className="text-right w-[30%] font-kregular">Closed</Text>
                  )}
                </View>
              ))}
            </View>

            <View className="w-full items-start">
              <Text className="text-lg font-ksemibold">Contact Number :</Text>
              <Text className="font-kregular">{contactNum}</Text>
            </View>

            <Text className="text-lg font-ksemibold">Menu :</Text>
            {placeData.price_or_menu && placeData.price_or_menu.length > 0 ? (
              <View className="w-full">
                {placeData.price_or_menu.map((imageUri, index) => (
                  <Image
                  key={index}
                  source={{ uri: imageUri }}
                  style={{
                    width: '100%', // Make it occupy full width
                    aspectRatio: 1, // Maintain a 1:1 aspect ratio (square images)
                    marginBottom: 10, // Add spacing between images
                  }}
                  resizeMode="contain"
                />
                ))}
              </View>
            ) : (
              <Text className="font-kregular mt-2">No menu available.</Text>
            )}

            <View className="w-full items-start my-3">
              <Text className="text-lg font-ksemibold">Tags :</Text>
              <Text className="font-kregular">{tags}</Text>
            </View>
          </View>
        ) : null}      
      </View>
      {/* Add Buttons Below */}
    <View className="flex-row items-center justify-evenly mt-5 mb-10">
      <Button
        title="Delete"
        handlePress={handleDelete}
        style="bg-primary w-2/5"
        textColor="text-white"
      />
      <Button
        title="Edit"
        handlePress={() => handleEdit(placeID, category)}
        style="bg-primary w-2/5"
        textColor="text-white"
      />
    </View>
    </View>
  );


  // Render reviews (currently empty)
  const renderReview = () => (
    <View className="h-full mx-5 ">
      {reviews.length === 0 ? (
        <Text>No reviews available</Text>
      ) : (
        reviews.map((review, index) => {
          const userProfile = userProfiles[reviews[index].user] || {};
          return (
            <View key={index} 
            className="items-start mb-3"
            >
              <View className="flex-row items-center">
                <Image source={{ uri: userProfile.profilePicture}} className="w-12 h-12 rounded-full" />
                <View className="ml-3 justify-start p-3">
                  <Text>{userProfile.username}</Text>
                  <Text>{new Date(review.datePosted).toLocaleDateString()}</Text>
                </View>
              </View>
              <View className="flex-row justify-start center mt-1 ">
                {[...Array(5)].map((_, i) => (
                  <Image
                    key={i}
                    source={icons.star}
                    className={`w-[30px] h-[35px] mx-2`}
                    resizeMode='cover'
                    tintColor={i < review.rating ? "#FFB655" : "gray"}
                  />
                ))}
              </View>
              <View className="w-full mt-5 flex-row justify-start">
                {review.photo && review.photo.map((photo, index) => (
                  <Image key={index} source={{ uri: photo }} className="w-32 h-36 " resizeMode='contain' />
                ))}
              </View>
              <View className="mt-5">
                <Text className="font-kregular text-sm">
                  {review.comment}
                </Text>
              </View>
              <View className="mt-5">
                <Text className="font-bold text-sm">Visited on:</Text>
                <Text className="p-2 bg-secondary mt-1 uppercase font-kbold text-justify">
                  {review.choiceQuestion }
                </Text>
              </View>
              <View className="w-full border-b-0.5 border-[#808080] mt-5">
                
              </View>
            </View>
          );
        })
      )}
       
    </View>
  );

  return (
    <View className="h-full items-center">
      <ScrollView className=" w-full">
        <View className="m-5">
        {category === 'event' ? (
          <Image
            source={{
              uri: poster,
              cache: 'default', // Options: 'default', 'reload', 'force-cache', 'only-if-cached'
            }}
            style={{
              width: '100%',
              aspectRatio: 1,
              borderRadius: 10,
              backgroundColor: '#E5E5E5', // Optional fallback background
            }}
            resizeMode="contain"
          />
          // <Image
          //   source={{ uri: poster }}
          //   className="w-full h-auto rounded-lg bg-secondary"
          //   style={{ aspectRatio: 1 }}
          // />
        ) : (
          <Poster image={poster} />
        )}
          <Text className="mt-4 ml-3 font-kbold text-3xl">{name}</Text>

          {category !== 'event' && (
            <DetailTab activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

          {/* dah masuk detail place */}
          <View>
          {activeTab === 'details' ? renderDetails() : renderReview()}
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View className=" flex-1 justify-center items-center blur-xl">
          <View className="border bg-secondary w-[295px] h-[250px] p-[20px] rounded-[8px]">
            <TouchableOpacity 
              onPress={toggleModalVisibility}
              className=" absolute top-6 right-6"
            >
              <Image source={icons.close} className="w-5 h-5 align-top"/>
            </TouchableOpacity> 
            <Text className="mt-9 font-kregular text-2xl text-center">
              Delete this place from database?
            </Text>
            <View className="flex-row items-center justify-evenly mt-5 mb-10">
              <Button 
              title="No"
              handlePress={toggleModalVisibility}
              style="bg-primary w-2/5"
              textColor="text-white"/>        

              <Button 
              title="Yes"
              handlePress={() => deletePlace(placeID, category)}
              style="bg-primary w-2/5"
              textColor="text-white"/>
            </View>
          </View>
        </View>
      </Modal> 
    </View>
  );
};

export default HomeDetails;