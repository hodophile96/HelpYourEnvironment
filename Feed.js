import React from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

export default function Feed() {
  const navigation = useNavigation();

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
        data={[] /* Your posts data here */}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View>
            <Text>Event Type: {item.eventType}</Text>
            <Text>Location: {item.location}</Text>
            <Text>Time: {item.time}</Text>
            <Text>Description: {item.description}</Text>
            <Button title="Like" onPress={() => handleLike(index)} />
            <Button title="Join" onPress={() => handleJoin(index)} />
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
});
