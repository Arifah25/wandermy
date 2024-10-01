import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TabComponent = ({ activeTab, setActiveTab }) => {
  return (
    <View className="mt-5 flex-row justify-evenly ">
      <TouchableOpacity 
        className="flex-1 py-[10px] bg-secondary items-center rounded-[10px] mx-[5px] active? bg-secondary : bg-gray-200"
        style={[activeTab === 'attraction' && styles.activeTab]} 
        onPress={() => setActiveTab('attraction')}
      >
        <Text className="text-base text-[#333] font-kregular" style={[activeTab === 'attraction' && styles.activeTabText]}>
          Attraction
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
        style={[activeTab === 'event' && styles.activeTab]} 
        onPress={() => setActiveTab('event')}
      >
        <Text className="text-base text-[#333] font-kregular" style={[ activeTab === 'event' && styles.activeTabText]}>
          Event
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
