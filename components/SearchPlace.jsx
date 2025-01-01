import React, { useContext, useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
//import Geolocation from 'react-native-geolocation-service'; // or 'react-native-geolocation-service'
import { CreateItineraryContext } from './../context/CreateItineraryContext';

const homePlace = {
  description: 'Home',
  geometry: { location: { lat: 48.8152937, lng: 2.4597668 } },
};
const workPlace = {
  description: 'Work',
  geometry: { location: { lat: 48.8496818, lng: 2.2940881 } },
};

//navigator.geolocation = Geolocation; // Set navigator.geolocation

const SearchPlace = () => {
    const {itineraryData, setItineraryData}=useContext(CreateItineraryContext);

    useEffect(() => {
        console.log(itineraryData); 
    }),[itineraryData]
     
  return (
    <View>
    <GooglePlacesAutocomplete
      placeholder='Search'
      minLength={2} // minimum length of text to search
      autoFocus={false}
      returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
      keyboardAppearance={'light'} // Can be left out for default keyboardAppearance https://facebook.github.io/react-native/docs/textinput.html#keyboardappearance
      listViewDisplayed='auto' // true/false/undefined
      fetchDetails={true}
      renderDescription={(row) => row.description} // custom description render
      onPress={(data, details = null) => {
        // 'details' is provided when fetchDetails = true
        console.log(data.description);
        setItineraryData({ ...itineraryData,
            locationInfo:{
                name: data.description,
                coordinates: details?.geometry.location,
                photoRef: details?.photos[0]?.photo_reference,
                url: details?.url,
            }
        })
      }}
      getDefaultValue={() => ''}
      query={{
        // available options: https://developers.google.com/places/web-service/autocomplete
        key: process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY,
        language: 'en', // language of the results
        // types: '(cities)', // default: 'geocode'
      }}
      styles={{
        container: {
            width: '91.6667%',
            alignItems: 'center',
          },
          textInputContainer: {
            width: '100%',
            borderColor: '#d9d9d9',
            borderWidth: 2,
            borderRadius: 6,
            textAlign: 'center',
          },
          description: {
            fontWeight: 'bold',
          },
          predefinedPlacesDescription: {
            color: '#1faadb',
          },
          listView: {
            borderColor: '#d9d9d9',
            borderLeftWidth: 2,
            borderRightWidth: 2,
            position: 'absolute', // Make sure the listView is positioned absolutely
            top: 49, // Adjust based on your layout
            zIndex: 9999, // High zIndex to ensure it appears on top of other components
            elevation: 5, // For Android elevation
            backgroundColor: '#fff', // Ensure the background is white to overlay properly
            width: '100%', // Adjust width based on your needs
          },
          row: {
            backgroundColor: '#fff', // Ensure the row background color is visible
            padding: 13,
            height: 44,
            flexDirection: 'row',
            alignItems: 'center',
            zIndex: 9999, // High zIndex for rows
            elevation: 5, // For Android
          },
          separator: {
            height: 1,
            backgroundColor: '#c8c7cc',
          },          
      }}
      currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
      currentLocationLabel='Current location'
      nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
      GoogleReverseGeocodingQuery={
        {
          // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
        }
      }
      GooglePlacesSearchQuery={{
        // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
        rankby: 'distance',
        type: 'cafe',
      }}
      filterReverseGeocodingByTypes={[
        // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
        // available options : https://developers.google.com/maps/documentation/geocoding/intro#Types
        'locality',
        'administrative_area_level_3',
      ]}
    //   predefinedPlaces={[homePlace, workPlace]}
      debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
    />
    </View>
  );
};

export default SearchPlace;