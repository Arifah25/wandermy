import React from 'react';
import { Image, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SearchPlace } from '../../../components';

const homePlace = {
  description: 'Home',
  geometry: { location: { lat: 48.8152937, lng: 2.4597668 } },
};
const workPlace = {
  description: 'Work',
  geometry: { location: { lat: 48.8496818, lng: 2.2940881 } },
};

const Search = () => {
  return (
    <SearchPlace />
  );
};

export default Search;