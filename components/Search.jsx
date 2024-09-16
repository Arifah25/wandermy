import { useState } from "react";
import { router, usePathname } from "expo-router";
import { View, TouchableOpacity, Image, TextInput, Alert } from "react-native";

import { icons } from "../constants";

const SearchInput = ({ initialQuery }) => {
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery || "");

  return (
    <View className="flex-row items-center space-x-4 w-[305px] h-14 px-4 bg-secondary rounded-xl border-2 border-secondary focus:border-black">
      <TextInput
        className="text-base mt-0.5 text-black flex-1 font-kregular"
        value={query}
        placeholder="Search"
        placeholderTextColor="#7E6C6C"
        onChangeText={(e) => setQuery(e)}
      />

      <TouchableOpacity
        onPress={() => {
          if (query === "")
            return Alert.alert(
              "Missing Query",
              "Please input something to search results across database"
            );

          if (pathname.startsWith("/search")) router.setParams({ query });
          else router.push(`/search/${query}`);
        }}
      >
        <Image source={icons.search} className="w-5 h-5" resizeMode="contain" tintColor='black' />
      </TouchableOpacity>
    </View>
    
  );
};

export default SearchInput;
