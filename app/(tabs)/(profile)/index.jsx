import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../../constants';
import { useRouter } from 'expo-router';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getDatabase, ref, get, remove } from 'firebase/database';


const Profile = () => {
  const router = useRouter();


  const [userData, setUserData] = useState([]);


  const auth = getAuth();
  const db = getDatabase();
  const userId = auth.currentUser?.uid;


  const userRef = ref(db, `users/${userId}`);
  get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      setUserData(userData);
      // console.log(userData);
      // // You can access the data like this:
      // console.log(userData.email);
      // console.log(userData.username);
      // console.log(userData.userPreference);
      // console.log(userData.profilePicture);
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });


  const handleLogout = () => {
    Alert.alert(
      "Are you sure you want to log out?",
      "",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            router.replace('(auth)/sign-in'); // Navigate to Login page
            console.log("Logged out successfully!");
          },
        },
      ],
      { cancelable: true }
    );
  };
 

  const handleDeleteAcc = () => {
    Alert.alert(
      "Are you sure you want to delete your account?",
      "This action cannot be undone.",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            // Prompt the user for their password
            Alert.prompt(
              "Reauthenticate",
              "Enter your password to confirm deletion.",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Submit",
                  onPress: async (enteredPassword) => {
                    try {
                      const user = auth.currentUser;

                      if (user) {
                        // Reauthenticate the user with their email and entered password
                        const credential = EmailAuthProvider.credential(user.email, enteredPassword);
                        await reauthenticateWithCredential(user, credential);

                        // Delete user data from Realtime Database
                        const userId = user.uid;
                        const userRef = ref(db, `users/${userId}`);
                        await remove(userRef);

                        // Delete user account from Firebase Authentication
                        await user.delete();

                        Alert.alert("Success", "Account deleted successfully.");
                        router.replace("(auth)/sign-in"); // Redirect to sign-in page
                      } else {
                        Alert.alert("Error", "No user is currently logged in.");
                      }
                    } catch (error) {
                      console.error("Error deleting account:", error);

                      if (error.code === "auth/wrong-password") {
                        Alert.alert("Error", "Invalid password. Please try again.");
                      } else if (error.code === "auth/requires-recent-login") {
                        Alert.alert(
                          "Session Expired",
                          "For security reasons, please sign in again and try deleting your account."
                        );
                        auth.signOut();
                        router.replace("(auth)/sign-in");
                      } else {
                        Alert.alert("Error", "Failed to delete account. Please try again.");
                      }
                    }
                  },
                },
              ],
              "secure-text" // Ensures the input field is secure for passwords
            );
          },
        },
      ]
    );
  };


  return (
    <View
      className="bg-white h-full flex-1 px-5 items-center justify-start"
    >
      <View
        className="w-full justify-center items-center px-5 m-8 mt-12"
      >
        {/* get profile photo from database */}
        <Image
          source={{uri:userData.profilePicture} || icons.profile}
          className="w-40 h-40 rounded-full"
        />
        <Text
          className="font-kregular text-2xl text-center lowercase m-4"
        >
          @{userData.username}
        </Text>
        {/* tags */}
        <Text className="font-kregular text-xl lowercase m-4">
          My Preferences:
        </Text>
        <View className="items-start border h-20 w-full p-[10px] rounded-md">
          {/* get from database */}
          <Text
            className="font-pregular text-center"
          >
            {userData.userPreference}
          </Text>
        </View>
      </View>
      <View className="justify-evenly w-11/12 px-5 ">
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/(profile)/edit')} // Navigate to Edit Profile page
          className="border-t-0.5"
        >
          <Text
            className="font-kregular text-xl my-4 text-center"
          >
            Edit Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/(profile)/bookmark')} // Navigate to Bookmark Places page
          className="border-t-0.5"
        >
          <Text
            className="font-kregular text-xl my-4 text-center"
          >
            Bookmark Places
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDeleteAcc} // Navigate to Delete Account page
          className="border-t-0.5"
        >
          <Text
            className="text-primary font-kregular text-xl my-4 text-center"
          >
            Delete Account
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogout} // Navigate to Login page (logout)
          className="border-y-0.5"
        >
          <Text
            className="text-primary font-kregular text-xl my-5 text-center"
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>


    </View>
  )
}


export default Profile;
