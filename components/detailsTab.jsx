import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const DetailTab = ({ activeTab, setActiveTab }) => {
  return (
    <View className="flex-row justify-evenly mx-2 py-3">
      <TouchableOpacity 
        className="flex-1 py-[10px] bg-secondary items-center rounded-[10px] mx-[5px] active? bg-secondary : bg-gray-200"
        style={[activeTab === 'details' && styles.activeTab]} 
        onPress={() => setActiveTab('details')}
      >
        <Text className="text-base text-[#333] font-kregular" style={[activeTab === 'details' && styles.activeTabText]}>
          details
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        className="flex-1 py-[10px] bg-secondary items-center rounded-[10px] mx-[5px] active? bg-secondary : bg-gray-200"
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
