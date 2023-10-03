import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Linking,
  Button,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import Geolocation from 'react-native-geolocation-service'; // Import geolocation library

export default function Feed() {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [ascendingOrder, setAscendingOrder] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState({});
  const [userDisplayName, setUserDisplayName] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentsToShow, setCommentsToShow] = useState(2);
  const [userLocation, setUserLocation] = useState(null); // Store user's current location
  const [filterDistance, setFilterDistance] = useState(15); // Default filter distance
  const [selectedDistance, setSelectedDistance] = useState('All'); // Default: Show all events
  const [selectedSort, setSelectedSort] = useState('asc');

// Function to get the user's current location
const getUserLocation = () => {
  Geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      console.log('User Location Latitude:', latitude);
      console.log('User Location Longitude:', longitude);

      // Now you can use the latitude and longitude for further processing.
    },
    (error) => {
      console.error('Error getting user location:', error);
    },
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
  );
};



useEffect(() => {
  fetchUserDisplayName();
  fetchEvents();
  fetchComments();
  getUserLocation(); // Get user's location when the component mounts
}, [ascendingOrder]);

// Function to filter events based on distance
const filterEventsByDistance = (events, distance) => {
  if (!userLocation) {
    return events; // If user location is not available, return all events
  }

  return events.filter((event) => {
    // Calculate the distance between user and event using Haversine formula
    const eventLocation = {
      latitude: event.location.latitude,
      longitude: event.location.longitude,
    };

    const rad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers
    const dLat = rad(eventLocation.latitude - userLocation.latitude);
    const dLong = rad(eventLocation.longitude - userLocation.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(userLocation.latitude)) *
        Math.cos(rad(eventLocation.latitude)) *
        Math.sin(dLong / 2) *
        Math.sin(dLong / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInKm = R * c;
    const distanceInMiles = distanceInKm * 0.621371;

    return distanceInMiles <= distance;
  });
};
const handleFilterByDistance = (distance) => {
  setSelectedDistance(distance);

  if (distance === 'All') {
    // Show all events without filtering
    fetchEvents();
  } else {
    // Filter events based on the selected distance and update the state
    const filteredEvents = filterEventsByDistance(events, distance);
    setEvents(filteredEvents);
  }
};

  const fetchUserDisplayName = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        setUserDisplayName(user.displayName || 'Anonymous');
      }
    } catch (error) {
      console.error('Error fetching user display name:', error);
    }
  };

  useEffect(() => {
    fetchUserDisplayName();
    fetchEvents();
    fetchComments();
  }, [ascendingOrder]);

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

      const sortedEvents = eventsData.sort((a, b) => {
        const dateA = a.date;
        const dateB = b.date;
        return ascendingOrder ? dateA - dateB : dateB - dateA;
      });

      setEvents(sortedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const toggleSortingOrder = () => {
    setSelectedSort(selectedSort === 'asc' ? 'desc' : 'asc');
  };


  const fetchComments = async () => {
    try {
      const commentsCollection = collection(db, 'comments');
      const commentsSnapshot = await getDocs(commentsCollection);
      const commentsData = {};

      commentsSnapshot.forEach((doc) => {
        const data = doc.data();
        const eventId = data.eventId;
        if (!commentsData[eventId]) {
          commentsData[eventId] = [];
        }
        commentsData[eventId].push({
          id: doc.id,
          text: data.text,
          createdBy: data.createdBy,
          userName: data.userName,
        });
      });

      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleComment = async (eventId, text) => {
    try {
      // Check if the comment text is empty
      if (text.trim() === '') {
        console.error('Comment text cannot be empty.');
        return;
      }
  
      const user = auth.currentUser;
      if (!user) {
        console.error('No user is signed in.');
        return;
      }
  
      const commentRef = collection(db, 'comments');
      await addDoc(commentRef, {
        eventId,
        text,
        createdBy: user.uid,
        userName: userDisplayName,
      });
  
      fetchComments();
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  

  const handleEditComment = async (eventId, commentId, newText) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No user is signed in.');
        return;
      }

      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        text: newText,
      });

      fetchComments();
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const commentRef = doc(db, 'comments', commentId);
      await deleteDoc(commentRef);

      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const toggleShowAllComments = () => {
    setShowAllComments(!showAllComments);
  };

  const loadMoreComments = () => {
    setCommentsToShow((prevCount) => prevCount + 2);
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

  const openGroups = () => {
    navigation.navigate('Groups');
  };

  const openCalendar = () => {
    navigation.navigate('JoinedEvents');
  };

  const openGoogleMaps = (googleMapsLink) => {
    if (googleMapsLink) {
      Linking.openURL(googleMapsLink);
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
      const eventDoc = await getDoc(eventRef);
  
      if (eventDoc.exists()) {
        const eventData = eventDoc.data() || {};
  
        // Initialize the like array if it's missing
        const likeArray = eventData.like || [];
  
        // Check if the user has already liked the event
        if (likeArray.includes(user.uid)) {
          console.error('User has already liked this event.');
          return;
        }
  
        // Update the event data to add the user's UID to the like array
        await updateDoc(eventRef, {
          like: arrayUnion(user.uid),
        });
  
        // Fetch events again to update the UI
        fetchEvents();
      }
    } catch (error) {
      console.error('Error handling like:', error);
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
      const eventDoc = await getDoc(eventRef);
  
      if (eventDoc.exists()) {
        const eventData = eventDoc.data() || {};
  
        // Initialize the join array if it's missing
        const joinArray = eventData.join || [];
  
        // Check if the user has already joined the event
        if (joinArray.includes(user.uid)) {
          console.error('User has already joined this event.');
          return;
        }
  
        // Update the event data to add the user's UID to the join array
        await updateDoc(eventRef, {
          join: arrayUnion(user.uid),
        });
  
        // Fetch events again to update the UI
        fetchEvents();
      }
    } catch (error) {
      console.error('Error handling join:', error);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Help Your Environment</Text>
        <TouchableOpacity onPress={goToProfile}>
          <Icon name="user" size={30} />
        </TouchableOpacity>
        <TouchableOpacity onPress={openGroups}>
          <Icon name="users" size={30} />
        </TouchableOpacity>
        <TouchableOpacity onPress={openCalendar}>
          <Icon name="calendar" size={30} />
        </TouchableOpacity>
      </View>

      <View style={styles.statementContainer}>
        <Text style={styles.statementText}>
          Share your thoughts and ideas to help the environment.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.createEventButton}
        onPress={goToEventDescription}
      >
        <Text style={styles.createEventButtonText}>Create Event</Text>
      </TouchableOpacity>

      <View style={styles.filtersContainer}>
        <View style={styles.filterContainer}>
          <Text style={styles.filterText}>Sort Order:</Text>
          <TouchableOpacity style={styles.sortButton} onPress={toggleSortingOrder}>
            <Icon
              name={selectedSort === 'asc' ? 'sort-amount-asc' : 'sort-amount-desc'}
              size={18}
              color="#666"
            />
            <Text style={styles.sortButtonText}>
              {selectedSort === 'asc' ? 'Ascending' : 'Descending'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterText}>View Events: </Text>
          <Picker
            style={styles.picker}
            selectedValue={selectedDistance}
            onValueChange={(itemValue) => handleFilterByDistance(itemValue)}
          >
            <Picker.Item label="Within 15 Miles" value="15" />
            <Picker.Item label="Within 25 Miles" value="25" />
            <Picker.Item label="Within 50 Miles" value="50" />
            <Picker.Item label="Show All Events" value="All" />
          </Picker>
        </View>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventType}>{item.eventType}</Text>
              <TouchableOpacity
                onPress={() => openGoogleMaps(item.location.googleMapsLink)}
              >
                <Icon name="map-marker" size={30} color="green" />
              </TouchableOpacity>
            </View>
            <Text style={styles.eventLocation}>{item.location.address}</Text>
            <Text style={styles.eventDateTime}>
              Date: {item.date.toLocaleDateString()} | Time: {item.time}
            </Text>
            <Text style={styles.eventDescription}>{item.description}</Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleLike(item.id)}
              >
                <Icon name="thumbs-up" size={18} color="blue" />
                <Text style={styles.actionButtonText}>
                  Like ({item.like.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleJoin(item.id)}
              >
                <Icon name="user-plus" size={18} color="green" />
                <Text style={styles.actionButtonText}>
                  Join ({item.join.length})
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.sectionHeading}>Comments</Text>
              <ScrollView style={styles.commentScrollView}>
                {comments[item.id] &&
                  comments[item.id]
                    .slice(0, commentsToShow)
                    .map((comment) => (
                      <View key={comment.id} style={styles.comment}>
                        <Text style={styles.commentUser}>
                          {comment.userName}:
                        </Text>
                        <Text style={styles.commentText}>{comment.text}</Text>
                        {comment.createdBy === auth.currentUser?.uid && (
                          <View style={styles.commentActions}>
                            <TouchableOpacity
                              onPress={() =>
                                handleEditComment(
                                  item.id,
                                  comment.id,
                                  'Updated Text'
                                )
                              }
                            >
                              <Text style={styles.editComment}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDeleteComment(comment.id)}
                            >
                              <Text style={styles.deleteComment}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ))}
                {!showAllComments &&
                  comments[item.id]?.length > commentsToShow && (
                    <TouchableOpacity onPress={toggleShowAllComments}>
                      <Text style={styles.loadMoreComments}>
                        Load more comments
                      </Text>
                    </TouchableOpacity>
                  )}
                {showAllComments &&
                  comments[item.id]?.length > commentsToShow && (
                    <TouchableOpacity onPress={loadMoreComments}>
                      <Text style={styles.loadMoreComments}>Read more</Text>
                    </TouchableOpacity>
                  )}
              </ScrollView>
              <TextInput
                style={styles.commentInput}
                placeholder="    Add a comment..."
                onChangeText={(text) => setCommentText(text)}
                value={commentText}
              />
              <TouchableOpacity
                onPress={() => handleComment(item.id, commentText)}
              >
                <Text style={styles.postComment}>Post</Text>
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
    backgroundColor: 'green',
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
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom:15,
  },
  sortButtonText: {
    marginLeft: 4,
    color: '#666',
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 25,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
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
  commentSection: {
    marginTop: 0,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 0,
  },
  commentScrollView: {
    flex: 1,
  },
  loadMoreComments: {
    color: 'blue',
    marginTop: 8,
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  commentUser: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  commentText: {
    flex: 1,
  },
  commentActions: {
    flexDirection: 'row',
  },
  editComment: {
    marginLeft: 8,
    color: 'blue',
  },
  deleteComment: {
    marginLeft: 8,
    color: 'red',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
    padding: 2,
    marginTop: 8,
  },
  postComment: {
    color: 'green',
    marginTop: 8,
    fontSize:15
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    
    marginBottom: 5,
  },
  filterText: {
    marginRight: 10,
    fontSize:15,
  },
  picker: {
    flex: 1, // Expand to fill available space
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
  },
});