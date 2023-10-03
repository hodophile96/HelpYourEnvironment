import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, FlatList, StyleSheet, Alert } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db, storage } from './firebase'; // Import your Firebase auth and Firestore instances
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'; // Import the FontAwesome icon component

export default function Profile({ navigation }) {
  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState('');
  const [events, setEvents] = useState([]);
  const [displayName, setDisplayName] = useState('');


  // Function to select a profile image from the gallery
  const selectProfileImage = () => {
    const options = {
      title: 'Select Profile Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      if (response.uri) {
        setProfileImage({ uri: response.uri });
      }
    });
  };

  const fetchBio = async () => {
    try {
      const user = auth.currentUser;
  
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setBio(userData.bio || '');
          setDisplayName(userData.displayName || ''); // Update to set the displayName
        }
      }
    } catch (error) {
      console.error('Error fetching bio:', error);
    }
  };
  
  
  const fetchEvents = async () => {
    try {
      const eventsCollection = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsData = eventsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          eventType: data.eventType,
          date: data.date.toDate(),
          time: data.time,
          description: data.description,
          location: data.location, // Assuming 'location' is an object with properties 'name', 'address', and 'googleMapsLink'
          createdBy: data.createdBy,
        };
      });
  
      // Filter events created by the currently signed-in user
      const user = auth.currentUser;
      const userEvents = eventsData.filter((event) => event.createdBy === user.uid);
  
      setEvents(userEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };
  

  useEffect(() => {
    fetchBio();
    fetchEvents();
  }, []);

  const handleDeleteEvent = async (eventId) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await deleteDoc(eventRef);
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

  const handleSaveProfile = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        console.error('No user is signed in.');
        return;
      }

      // Update the bio in Firebase
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { bio });

      // If a new profile image is selected, update it in Firebase Storage
      if (profileImage) {
        const imageUrl = await uploadProfileImage(user.uid, profileImage);
        // Update the profile image URL in Firestore
        await updateDoc(userRef, { profileImageUrl: imageUrl });
      }

      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const uploadProfileImage = async (userId, image) => {
    try {
      const storageRef = storage.ref(`profile_images/${userId}`);
      const response = await storageRef.putFile(image.uri);
      const imageUrl = await storageRef.getDownloadURL();
      return imageUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return null;
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.navigate('SignIn');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
  style={styles.signOutButton}
  onPress={handleSignOut}
>
  <View style={styles.buttonContainer}>
    <Text style={styles.signOutButtonText}>Sign Out</Text>
  </View>
</TouchableOpacity>
      <View style={styles.profileContainer}>
  
    <View style={styles.profileImageContainer}>
      {profileImage ? (
        <Image source={profileImage} style={styles.profileImage} />
      ) : (
        <FontAwesomeIcon name="user-circle" size={100} color="gray" />
      )}
    </View>
 
  <View style={styles.usernameContainer}>
    <Text style={styles.usernameText}>{displayName}</Text>
  </View>
</View>
     
      <Text style={styles.eventHeader}>Events Created by You</Text>
      <FlatList
  data={events.filter((event) => event.createdBy === auth.currentUser.uid)}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View style={styles.eventCard}>
      <Text>{item.eventType}</Text>
      <Text>Date: {item.date.toDateString()}</Text> 
      <Text>Time: {item.time}</Text> 
      <Text>Description: {item.description}</Text>
      <Text>Location: {item.location.name}</Text>
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
    padding: 16,
  },
  signOutButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  buttonContainer: {
    flexDirection:'row',
    backgroundColor: 'green', // Customize the background color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButtonText: {
    color: 'white', // Customize the text color
    fontSize: 16,
  
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginLeft: 16,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginRight: 16,
  },
  profileImage: {
    flex: 1,
    width: null,
    height: null,
  },
  bioInput: {
    flex: 1,
    fontSize: 16,
  },
  saveProfileButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 16,
  },
  saveProfileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
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
