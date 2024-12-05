import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import {CreateItineraryContext} from '../context/CreateItineraryContext'
import { CartProvider } from "../context/CartContext";
import { useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [itineraryData, setItineraryData]=useState([]);
  
  const [fontsLoaded, error] = useFonts({
    "Kanit-Regular": require("../assets/fonts/Kanit-Regular.ttf"),
    "Kanit-Bold": require("../assets/fonts/Kanit-Bold.ttf"),
    "Kanit-SemiBold": require("../assets/fonts/Kanit-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync(); 

  }, [fontsLoaded, error])

  if (!fontsLoaded && !error) return null;
  

  return (
    <CartProvider>
    <CreateItineraryContext.Provider value={{itineraryData, setItineraryData}}>
    <Stack>
      <Stack.Screen 
      name="index" 
      options={{headerShown: false}}
      />
      <Stack.Screen 
      name="(auth)" 
      options={{headerShown: false}}
      />
      <Stack.Screen 
      name="(tabs)" 
      options={{headerShown: false}}
      />
      <Stack.Screen 
      name="(admin)" 
      options={{headerShown: false}}
      />
    </Stack>
    </CreateItineraryContext.Provider>
    </CartProvider>
  );
}
