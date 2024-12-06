import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { icons } from '@/constants';
import Feather from '@expo/vector-icons/Feather';

const HeaderWithCart = ({ onCartPress }) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex-row items-center mx-6 justify-between">
      <TouchableOpacity onPress={handleBack} style={{  marginTop: 5 }}>
        <Image source={icons.left} style={{ width: 24, height: 24, tintColor: '#000' }} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onCartPress} style={{  marginTop: 5 }}>
    <Feather name="edit" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default HeaderWithCart;