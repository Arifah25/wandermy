import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { icons } from '../constants'; // Adjust the import path

const Rating = ({ rating, onRatingPress }) => {
    const starComponents = [];
    for (let i = 1; i <= 5; i++) {
        starComponents.push(
            <TouchableOpacity key={i} onPress={() => onRatingPress(i)}>
                <Image
                    source={icons.star}
                    style={{ width: 50, height: 50, tintColor: i <= rating ? '#FFB655' : 'gray' }}
                />
            </TouchableOpacity>
        );
    }

    return (
        <View className="mt-4">
            <Text className="font-kregular text-xl text-black">Overall Rating:</Text>
            <View className="flex-row justify-evenly gap-3 center mt-3">
                {starComponents}
            </View>
        </View>
    );
};

export default Rating;
