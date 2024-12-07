import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import { icons } from '../../../../constants';
import NewItinerary from './new';
import SelectTraveler from './traveler';
import SelectBudget from './budget';
import ChoosePlaces from './choose-places';
import DetailsPlaces from './place-details';
import ReviewDetails from './reviewdetails';
import ReviewItinerary from './review-itinerary';

const Stack = createNativeStackNavigator();

const HeaderIcon = ({ onPress, icon }) => (
    <TouchableOpacity onPress={onPress} style={{ margin: 10 }}>
      <Image source={icon} style={{ width: 24, height: 24, tintColor: '#fff' }} />
    </TouchableOpacity>
);

const CreateItineraryLayout = () => {
    const router = useRouter();
    const handleBack = () => {
    router.back();
    }

    return (
        <Stack.Navigator>
            {/* <Stack.Screen
                name='index'
                component={MyItinerary}
                options={{
                    headerShown: false,
                    headerTitle: 'Create Itinerary',
                    headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
                    headerTitleAlign: 'center',
                    headerStyle: { backgroundColor: '#A91D1D', height: 95 },
                    headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
                    }}
            /> */}
            <Stack.Screen
                name="new"
                component={NewItinerary}
                options={{
                headerShown: true,
                headerTitle: 'Create Itinerary',
                headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
                headerTitleAlign: 'center',
                headerStyle: { backgroundColor: '#A91D1D', height: 95 },
                headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
                }}
            />
            <Stack.Screen
                name="traveler"
                component={SelectTraveler}
                options={{ 
                headerTitle: 'Traveler',
                headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
                headerTitleAlign: 'center',
                headerStyle: { backgroundColor: '#A91D1D' },
                headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
                }}
            />
            <Stack.Screen
                name="budget"
                component={SelectBudget}
                options={{ 
                headerTitle: 'Budget',
                headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
                headerTitleAlign: 'center',
                headerStyle: { backgroundColor: '#A91D1D' },
                headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
                }}
            />
            <Stack.Screen
                name="reviewdetails"
                component={ReviewDetails}
                options={{ 
                headerShown: false,
                // headerTitle: 'Review Your Itinerary',
                headerTitleStyle: { color: 'transparent', fontFamily: 'Kanit-Regular', fontSize: 20 },
                headerTitleAlign: 'center',
                headerStyle: { backgroundColor: '#transparent' },
                headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
                }}
            />
            <Stack.Screen
                name="choose-places"
                component={ChoosePlaces}
                options={{ 
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name='place-details'
                component={DetailsPlaces}
                options={{
                    headerShown: false,
                }}
            />
             <Stack.Screen
                name='review-itinerary'
                component={ReviewItinerary}
                options={{
                    headerShown: false,
                }}
            />
        </Stack.Navigator>  
    )
}

export default CreateItineraryLayout