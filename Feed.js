import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase'; // Import your Firebase configuration here

export default function Feed() {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);

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
          location: data.location,
          time: data.time, // Use as is or format as needed
          description: data.description,
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

  const handleLike = (postIndex) => {
    // Handle liking a post (e.g., update likes in the database)
    // You can implement this based on your backend logic
  };

  const handleJoin = (postIndex) => {
    // Handle joining an event (e.g., add user to the event)
    // You can implement this based on your backend logic
  };

  const goToProfile = () => {
    navigation.navigate('Profile');
  };

  const goToEventDescription = () => {
    navigation.navigate('EventDescription');
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Help Your Environment</Text>
        <TouchableOpacity onPress={goToProfile}>
          <Icon name="user" size={30} />
        </TouchableOpacity>
      </View>

      {/* Statement and Post Button */}
      <View style={styles.statementContainer}>
        <Text style={styles.statementText}>Have something on your mind? Why not post it...</Text>
        <TouchableOpacity style={styles.postButton} onPress={goToEventDescription}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Post List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.eventContainer}>
            <Text style={styles.eventType}>Event Type: {item.eventType}</Text>
            <Text style={styles.location}>Location: {item.location}</Text>
            <Text style={styles.time}>Time: {item.time}</Text>
            <Text style={styles.description}>Description: {item.description}</Text>
            <TouchableOpacity style={styles.likeButton} onPress={() => handleLike(item.id)}>
              <Text style={styles.likeButtonText}>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.joinButton} onPress={() => handleJoin(item.id)}>
              <Text style={styles.joinButtonText}>Join</Text>
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
    paddingTop: Platform.OS === 'ios' ? 40 : 0, // Adjust for iOS notch
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statementText: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
  },
  postButton: {
    backgroundColor: 'blue',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
  },
  eventContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 8,
    marginBottom: 16,
  },
  eventType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 14,
  },
  time: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
  },
  likeButton: {
    backgroundColor: 'lightblue',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  likeButtonText: {
    color: 'black',
    fontSize: 16,
  },
  joinButton: {
    backgroundColor: 'lightgreen',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  joinButtonText: {
    color: 'black',
    fontSize: 16,
  },
});
