import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';

export default function JoinedEvents() {
  const [joinedEvents, setJoinedEvents] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchJoinedEvents();
    }
  }, [user]);

  const fetchJoinedEvents = async () => {
    try {
      const eventsCollection = collection(db, 'events');
      const q = query(eventsCollection, where('join', 'array-contains', user.uid));
      const eventsSnapshot = await getDocs(q);
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
        };
      });
      setJoinedEvents(eventsData);
    } catch (error) {
      console.error('Error fetching user joined events:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Joined Events</Text>
      {joinedEvents.length === 0 ? (
        <Text>No events joined yet.</Text>
      ) : (
        <FlatList
          data={joinedEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <Text style={styles.eventType}>{item.eventType}</Text>
              <Text style={styles.eventLocation}>{item.location}</Text>
              <Text style={styles.eventDateTime}>
                Date: {item.date.toLocaleDateString()} | Time: {item.time}
              </Text>
              <Text style={styles.eventDescription}>{item.description}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  },
});
