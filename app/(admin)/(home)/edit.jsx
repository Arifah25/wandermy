import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useRoute } from '@react-navigation/native';

const Edit = () => {
  const router = useRouter();
  const route = useRoute();

  const {placeID, category} = route.params;

  // const { latitude, longitude, address } = useLocalSearchParams(); // Use the correct hook

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");  
  const [websiteLink, setWebsiteLink] = useState("");
  const [contactNum, setContactNum] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [placeData, setPlaceData] = useState(null);
  const [startDate, setStartDate] = useState({});
  const [endDate, setEndDate] = useState({});  
  const [startTime, setStartTime] = useState({});
  const [endTime, setEndTime] = useState({});
  const [operatingHours, setOperatingHours] = useState([]);


  return (
    <View>
      <Text>Edit</Text>
    </View>
  )
}

export default Edit