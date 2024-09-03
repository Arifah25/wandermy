import { Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "../constants";
import { Button } from "../components";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";

export default function Index() {
  // for navigation
  const router = useRouter();
  
  const auth = getAuth();
  const user = auth.currentUser;

  const OnStart = () => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      // ...
      router.replace("/(tabs)/(home)/");
    } else {
      // No user is signed in.
      router.push("(auth)/sign-in")
    }
  }

  return (
    <SafeAreaView 
    className="bg-white h-full flex-1 py-20 items-center justify-around"
    >
      <Text 
      className="font-kbold text-5xl text-center -mb-7"
      >
        Welcome to{"\n"}
        {/* If the logo change */}
        {/* <Text className="text-primary">WanderMy!</Text> */}
      </Text>
      {/* Change the source if want to change the icons */}
      <Image
      source={icons.wandermy1}
      className="w-72 h-48"
      resizeMode="contain"
      />
      <Text
      className="font-pbold text-2xl text-center"
      >
        A Malaysia Travel{"\n"}
        Assistant
      </Text>
      <Button 
      title="Get Started"
      handlePress={OnStart}
      // for style, key in the width, color, and margin
      style="bg-primary w-1/2 "
      textColor="text-white"
      />
    </SafeAreaView>
  );
}
