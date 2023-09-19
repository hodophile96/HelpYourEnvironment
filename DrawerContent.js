import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { signOut } from './firebase'; // Implement your signOut function from Firebase

const DrawerContent = () => {
  const navigation = useNavigation();

  const handleSignOut = async () => {
    try {
      // Call your signOut function from Firebase here
      await signOut();
      // Navigate to the authentication screen or wherever you want after signing out
      navigation.navigate('Authentication'); // Replace with your desired screen
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <DrawerContentScrollView>
      <View style={styles.drawerContent}>
        {/* Drawer Header */}
        <View style={styles.drawerHeader}>
          {/* Add your user profile or app logo here */}
          <Text style={styles.drawerHeaderText}>Your App</Text>
        </View>
        {/* Drawer Items */}
        <View style={styles.drawerItems}>
          {/* Add other drawer items here */}
          <TouchableOpacity style={styles.drawerItem} onPress={handleSignOut}>
            <Text>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    backgroundColor: 'green', // Customize the header background color
  },
  drawerHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white', // Customize the header text color
  },
  drawerItems: {
    marginTop: 20,
  },
  drawerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default DrawerContent;
