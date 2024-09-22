import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const PinLocation = () => {
  const [region, setRegion] = useState(null); // Store map region
  const [pinLocation, setPinLocation] = useState(null); // Store marker location
  const [errorMsg, setErrorMsg] = useState(null);

  // Ask for location permission and get current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const currentRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922, // Adjust to control zoom level
        longitudeDelta: 0.0421,
      };

      setRegion(currentRegion); // Set initial map region to user's location
      setPinLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }); // Set initial marker at user's location
    })();
  }, []);

  // Function to handle placing marker on map press
  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setPinLocation({ latitude, longitude });
  };

  return (
    <View style={styles.container}>
      {region ? (
        <MapView
          style={styles.map}
          initialRegion={region}
          onPress={handleMapPress} // Set marker on map press
        >
          {pinLocation && (
            <Marker
              coordinate={pinLocation}
              title="Selected Location"
              description={`${pinLocation.latitude}, ${pinLocation.longitude}`}
            />
          )}
        </MapView>
      ) : (
        <Text>{errorMsg || "Loading map..."}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default PinLocation;
