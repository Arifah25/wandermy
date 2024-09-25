import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TabComponent = ({ activeTab, setActiveTab }) => {
  return (
    <View className="mt-5 flex-row justify-evenly mx-2 ">
      <TouchableOpacity 
        className="flex-1 py-[10px] bg-secondary items-center rounded-[10px] mx-[5px] active? bg-secondary : bg-gray-200"
        style={[activeTab === 'attractions' && styles.activeTab]} 
        onPress={() => setActiveTab('attractions')}
      >
        <Text className="text-base text-[#333] font-kregular" style={[activeTab === 'attractions' && styles.activeTabText]}>
          Attractions
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        className="flex-1 py-[10px] bg-secondary items-center rounded-[10px] mx-[5px] active? bg-secondary : bg-gray-200"
        style={[activeTab === 'dining' && styles.activeTab]} 
        onPress={() => setActiveTab('dining')}
      >
        <Text className="text-base text-[#333] font-kregular" style={[ activeTab === 'dining' && styles.activeTabText]}>
          Dining
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        className="flex-1 py-[10px] bg-secondary items-center rounded-[10px] mx-[5px] active? bg-secondary : bg-gray-200"
        style={[activeTab === 'events' && styles.activeTab]} 
        onPress={() => setActiveTab('events')}
      >
        <Text className="text-base text-[#333] font-kregular" style={[ activeTab === 'events' && styles.activeTabText]}>
          Events
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

export default TabComponent;
