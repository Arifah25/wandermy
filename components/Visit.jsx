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
                            ${isLoading ? "opacity-50" : ""}
                            ${selectedChoice === choice ? "bg-secondary" : "bg-gray-200"}`}
                        disabled={isLoading}
                    >
                        <Text className={`text-black font-kregular justify-center items-center text-sm`}>
                            {choice}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default Visit;
