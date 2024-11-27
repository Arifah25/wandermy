import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import { icons } from '../../../../constants';
import NewItinerary from './new';
import SelectTraveler from './traveler';
import SelectDate from './date';
import SelectBudget from './budget';
import ReviewItinerary from './reviewiti';
import GenerateItinerary from './generate';

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
                headerTitle: 'Itinerary Crafting',
                headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
                headerTitleAlign: 'center',
                headerStyle: { backgroundColor: '#A91D1D' },
                headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
                }}
            />
            <Stack.Screen
                name="date"
                component={SelectDate}
                options={{ 
                headerTitle: 'Itinerary Crafting',
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
                headerTitle: 'Itinerary Crafting',
                headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
                headerTitleAlign: 'center',
                headerStyle: { backgroundColor: '#A91D1D' },
                headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
                }}
            />
            <Stack.Screen
                name="reviewiti"
                component={ReviewItinerary}
                options={{ 
                headerTitle: 'Itinerary Crafting',
                headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
                headerTitleAlign: 'center',
                headerStyle: { backgroundColor: '#A91D1D' },
                headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
                }}
            />
            <Stack.Screen
                name="generate"
                component={GenerateItinerary}
                options={{ 
                headerTitle: 'Itinerary Crafting',
                headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
                headerTitleAlign: 'center',
                headerStyle: { backgroundColor: '#A91D1D' },
                headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
                }}
            />
        </Stack.Navigator>  
    )
}

export default CreateItineraryLayout