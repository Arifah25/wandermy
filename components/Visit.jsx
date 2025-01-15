import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';

const Visit = ({
    handlePress,
    selectedChoice,
    isLoading,
}) => {
    return (
        <View>
            <Text className="font-kregular text-xl">
                When did you visit?
            </Text>
            <View className="w-full flex-row justify-evenly mt-4">
                {['weekday', 'weekend', 'public holiday'].map(choice => (
                    <TouchableOpacity 
                        key={choice}
                        onPress={() => handlePress(choice)}
                        activeOpacity={0.7}
                        className={`rounded-md w-[31%] h-10 justify-center items-center
                            ${isLoading ? "opacity-50" : ""}`}
                        style={{
                            backgroundColor: selectedChoice === choice ? '#A91D1D' : '#E0E0E0', // Red for selected, custom gray for unselected
                        }}
                        disabled={isLoading}
                    >
                        <Text
                            style={{
                                color: selectedChoice === choice ? '#FFF' : '#000',
                                fontFamily: 'KRegular',
                                fontSize: 14,
                            }}
                        >
                            {choice}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default Visit;
