import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from './firebase';

export default function Feed() {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsCollection = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsData = eventsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          eventType: data.eventType,
          location: data.location,
          time: data.time,
          date: data.date.toDate(),
          description: data.description,
          createdBy: data.createdBy,
          join: data.join || [],
          like: data.like || [],
        };
      });
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleJoin = async (eventId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No user is signed in.');
        return;
      }

      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        join: arrayUnion(user.uid),
      });
      fetchEvents(); // Refresh the events after joining
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  const handleLike = async (eventId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No user is signed in.');
        return;
      }

      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        like: arrayUnion(user.uid),
      });
      fetchEvents(); // Refresh the events after liking
    } catch (error) {
      console.error('Error liking event:', error);
    }
  };

  const openDrawer = () => {
    navigation.openDrawer();
  };

  const goToProfile = () => {
    navigation.navigate('Profile');
  };

  const goToEventDescription = () => {
    navigation.navigate('EventDescription');
  };

  const openChat = () => {
    navigation.navigate('ContactListScreen');
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer}>
          <Icon name="bars" size={30} style={styles.hamburgerIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Help Your Environment</Text>
        <TouchableOpacity onPress={goToProfile}>
          <Icon name="user" size={30} />
        </TouchableOpacity>
        <TouchableOpacity onPress={openChat}>
          <Icon name="comment" size={30} />
        </TouchableOpacity>
      </View>

      {/* Statement */}
      <View style={styles.statementContainer}>
        <Text style={styles.statementText}>
          Share your thoughts and ideas to help the environment.
        </Text>
      </View>

      {/* Create Event Button */}
      <TouchableOpacity
        style={styles.createEventButton}
        onPress={goToEventDescription}
      >
        <Text style={styles.createEventButtonText}>Create Event</Text>
      </TouchableOpacity>

      {/* Event List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventType}>{item.eventType}</Text>
              <Text style={styles.eventLocation}>{item.location}</Text>
            </View>
            <Text style={styles.eventDateTime}>
              Date: {item.date.toLocaleDateString()} | Time: {item.time}
            </Text>
            <Text style={styles.eventDescription}>{item.description}</Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleLike(item.id)}
              >
                <Icon name="thumbs-up" size={18} color="#666" />
                <Text style={styles.actionButtonText}>
                  Like ({item.like.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleJoin(item.id)}
              >
                <Icon name="user-plus" size={18} color="#666" />
                <Text style={styles.actionButtonText}>
                  Join ({item.join.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'white',
    paddingTop: 16,
  },
  hamburgerIcon: {
    color: 'black',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statementContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  statementText: {
    fontSize: 16,
  },
  createEventButton: {
    backgroundColor: 'blue',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  createEventButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventType: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
  },
  eventDateTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionButtonText: {
    marginLeft: 4,
    color: '#666',
  },
});
