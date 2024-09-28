import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const Map = ({
  initialRegion,          // Default region for the map
  onLocationSelected,     // Function to handle location confirmation
  confirmButtonText = 'Confirm Location', // Customizable button text
  placeholderText = 'Tap on the map to select a location' // Placeholder for address text
}) => {
  const [region, setRegion] = useState(initialRegion || null); // Store map region
  const [pinLocation, setPinLocation] = useState(null); // Store marker location
  const [address, setAddress] = useState(''); // Store address of the marker
  const [errorMsg, setErrorMsg] = useState(null);

  // Ask for location permission and get current location
  useEffect(() => {
    if (!initialRegion) {
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

        // Reverse geocode initial location
        fetchAddress(location.coords.latitude, location.coords.longitude);
      })();
    }
  }, []);

  // Function to handle placing marker on map press
  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setPinLocation({ latitude, longitude });

    // Fetch address from the new pin location
    fetchAddress(latitude, longitude);
  };

  // Function to fetch the address based on coordinates
  const fetchAddress = async (latitude, longitude) => {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (address) {
        const formattedAddress = `${address.street}, ${address.city}, ${address.region}, ${address.postalCode}`;
        setAddress(formattedAddress); // Set address for display
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  // Function to handle confirmation and notify the parent component
  const handleConfirmLocation = () => {
    if (pinLocation && onLocationSelected) {
      onLocationSelected({
        latitude: pinLocation.latitude,
        longitude: pinLocation.longitude,
        address, // Optional address to pass if needed
      });
    }
  };

  return (
    <View style={styles.container}>
      {region ? (
        <>
          <MapView
            style={styles.map}
            initialRegion={region}
            onPress={handleMapPress} // Set marker on map press
          >
            {pinLocation && (
              <Marker
                coordinate={pinLocation}
                title={address || 'Location'}
                description={`${pinLocation.latitude}, ${pinLocation.longitude}`} // Display address if available
              />
            )}
          </MapView>
          <View style={styles.confirmContainer}>
            <Text style={styles.addressText}>
              {address || placeholderText}
            </Text>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
              <Text style={styles.confirmButtonText}>{confirmButtonText}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text>{errorMsg || "Loading map..."}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'start',
    alignItems: 'center',
    height: 'full',
    backgroundColor: 'white',
  },
  map: {
    width: '100%',
    height: '85%', // Adjust the map height to leave space for the button
  },
  confirmContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
  addressText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  confirmButton: {
    backgroundColor: '#A91D1D',
    padding: 15,
    borderRadius: 8,
    width: '70%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Map;
