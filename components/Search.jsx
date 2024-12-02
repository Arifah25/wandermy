import { useState, useEffect } from "react";
import { router, usePathname } from "expo-router";
import { View, TouchableOpacity, Image, TextInput, Alert, FlatList } from "react-native";

import { icons } from "../constants";

const SearchInput = ({ 
  initialQuery,
  width, 
  activeTab, 
  places, 
  setFilteredPlaces, // Add this prop
}) => {
  const [query, setQuery] = useState(initialQuery || "");

  useEffect(() => {
    const filtered = places.filter((place) => {
      return (
        place.category === activeTab && 
        (place.name?.toLowerCase().includes(query.toLowerCase()) || 
         place.tags?.toLowerCase().includes(query.toLowerCase())  ||
         place.address?.toLowerCase().includes(query.toLowerCase())) 
      );
    });

    setFilteredPlaces(filtered); // Update the filteredPlaces state
  }, [query, activeTab, places]); // Update the filteredPlaces state when query, activeTab, or places change

  return (
    <View className={`flex-row items-center h-14 px-4 ${width} rounded-md border-2 border-secondary focus:border-black`}>
      <TextInput
        className="text-base mt-0.5 text-black flex-1 font-kregular"
        value={query}
        placeholder="Search"
        placeholderTextColor="#7E6C6C"
        onChangeText={(e) => setQuery(e)}
      />

      <TouchableOpacity>
        <Image source={icons.search} className="w-5 h-5" resizeMode="contain" tintColor='black' />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;