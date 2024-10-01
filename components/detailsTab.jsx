import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const DetailTab = ({ activeTab, setActiveTab }) => {
  return (
    <View className="flex-row justify-between  py-3 h-16">
      <TouchableOpacity 
        className="flex-1 justify-center bg-secondary items-center rounded-lg mx-3 active? bg-secondary : bg-gray-200"
        style={[activeTab === 'details' && styles.activeTab]} 
        onPress={() => setActiveTab('details')}
      >
        <Text className="text-base text-[#333] font-kregular" style={[activeTab === 'details' && styles.activeTabText]}>
          details
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        className="flex-1 justify-center bg-secondary items-center rounded-lg mx-3 active? bg-secondary : bg-gray-200"
        style={[activeTab === 'reviews' && styles.activeTab]} 
        onPress={() => setActiveTab('reviews')}
      >
        <Text className="text-base text-[#333] font-kregular" style={[ activeTab === 'reviews' && styles.activeTabText]}>
          reviews
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  
  activeTab: {
    backgroundColor: '#FF6F61',
  },
  activeTabText: {
    color: '#FFF',
  },
});

export default DetailTab;
