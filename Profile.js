import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, FlatList, StyleSheet, Alert } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase'; // Import your Firebase auth and Firestore instances

export default function Profile({ navigation }) {
  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState('Enter your bio here');
  const [events, setEvents] = useState([]);

  const selectProfileImage = () => {
    // (Same as in your previous code)
  };

  const fetchEvents = async () => {
    try {
      const eventsCollection = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsData = eventsSnapshot.docs.map((doc) => {
        const data = doc.data();
        // Assuming data.time is a string, you can use it as is or format it as needed
        return {
          id: doc.id,
          eventType: data.eventType,
          date: data.date.toDate(), // Convert Firestore Timestamp to JavaScript Date
          time: data.time, // Use as is or format as needed
          description: data.description,
          location: data.location,
          createdBy: data.createdBy, // Add createdBy field
        };
      });
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDeleteEvent = async (eventId) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await deleteDoc(eventRef);
      // After deleting, fetch and update the events list
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const confirmDeleteEvent = (eventId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this event?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => handleDeleteEvent(eventId),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      // After signing out, navigate to the SignIn page or any other desired page.
      navigation.navigate('SignIn');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={selectProfileImage}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={profileImage} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}></View>
            )}
          </View>
        </TouchableOpacity>
        <TextInput
          style={styles.bioInput}
          value={bio}
          onChangeText={setBio}
        />
      </View>
      
      <Text style={styles.eventHeader}>Here is the list of events created by you</Text>

      <FlatList
        data={events.filter((event) => event.createdBy === auth.currentUser.uid)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text>{item.eventType}</Text>
            <Text>Date: {item.date.toDateString()}</Text>
            <Text>Time: {item.time}</Text>
            <Text>Description: {item.description}</Text>
            <Text>Location: {item.location}</Text>
            <TouchableOpacity onPress={() => confirmDeleteEvent(item.id)}>
              <Text style={styles.deleteButton}>Delete Event</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  signOutButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
  },
  signOutButtonText: {
    color: 'blue',
    fontSize: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20, // Updated marginTop to create space
    marginLeft: 16,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  profileImage: {
    flex: 1,
    width: null,
    height: null,
  },
  profileImagePlaceholder: {
    flex: 1,
    backgroundColor: 'gray',
  },
  bioInput: {
    flex: 1,
    marginLeft: 16,
  },
  eventHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 16,
    marginLeft: 16,
  },
  eventCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 8,
    marginBottom: 16,
  },
  deleteButton: {
    color: 'red',
    marginTop: 8,
  },
});
