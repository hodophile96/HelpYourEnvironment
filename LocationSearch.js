import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { collection, addDoc } from 'firebase/firestore'; // Import collection and addDoc from firestore
import { db } from './firebase'; // Adjust the path to match your project structure



export default function LocationSearch() {
  const navigation = useNavigation(); // Use useNavigation hook

  const handleLocationSelect = async (data, details) => {
    try {
      // Create a new document in a 'locations' collection in Firestore
      const locationsCollectionRef = collection(db, 'locations');
      const newLocationDocRef = await addDoc(locationsCollectionRef, {
        name: details.name,
        address: details.formatted_address,
        // Store the Google Maps link as 'googleMapsLink'
        googleMapsLink: `https://www.google.com/maps/place/?q=${details.formatted_address}`,
      });

      // Log the Google Maps link to the console
      console.log('Google Maps Link:', `https://www.google.com/maps/place/?q=${details.formatted_address}`);

      // Navigate back to EventDescription and pass the new location data
      navigation.navigate('EventDescription', {
        locationData: {
          name: details.name,
          address: details.formatted_address,
          googleMapsLink: `https://www.google.com/maps/place/?q=${details.formatted_address}`,
        },
      });
    } catch (error) {
      console.error('Error adding location to Firestore:', error);
    }
  };

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder="Search for a location"
        onPress={(data, details) => handleLocationSelect(data, details)}
        fetchDetails={true}
        query={{
          key: 'AIzaSyBUoOFCwcXw4k_wqJ1XHPMOxZn1vy50U_A', // Replace with your Google API key
          language: 'en',
        }}
        styles={{
          container: styles.autocompleteContainer,
          textInput: styles.autocompleteTextInput,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  autocompleteContainer: {
    flex: 1,
  },
  autocompleteTextInput: {
    fontSize: 16,
  },
});