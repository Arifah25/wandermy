import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';

const Visit = ({
    handlePress,
    selectedChoice,
    isLoading,
}) => {
    return (
        <View>
            <Text className="mt-9 font-kregular text-lg">
                When did you visit?
            </Text>
            <View className="flex-row justify-evenly mt-4">
                {['weekday', 'weekend', 'public holiday'].map(choice => (
                    <TouchableOpacity 
                        key={choice}
                        onPress={() => handlePress(choice)}
                        activeOpacity={0.7}
                        className={`rounded-xl w-[120px] h-[33px] flex flex-row justify-center items-center
                            ${isLoading ? "opacity-50" : ""}
                            ${selectedChoice === choice ? "bg-secondary" : "bg-gray-200"}`}
                        disabled={isLoading}
                    >
                        <Text className={`text-black font-kregular text-sm`}>
                            {choice}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default Visit;
