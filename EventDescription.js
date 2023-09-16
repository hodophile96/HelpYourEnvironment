import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from './firebase'; // Import your Firebase configuration here

export default function EventDescription({ navigation }) {
  const [eventType, setEventType] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handlePost = async () => {
    try {
      // Get the currently signed-in user
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error('No user is signed in.');
        return;
      }

      // Create a reference to the Firestore collection (e.g., 'events')
      const eventsCollectionRef = collection(db, 'events');

      // Add a new document to the collection with the event details and user UID
      await addDoc(eventsCollectionRef, {
        eventType,
        date,
        time,
        description,
        location,
        createdBy: currentUser.uid, // Store the user's UID
      });

      // Clear input fields
      setEventType('');
      setDescription('');
      setLocation('');

      // Navigate to the Feed Page after posting
      navigation.navigate('Feed');
    } catch (error) {
      console.error('Error posting event:', error);
    }
  };

  const onDateChange = (event, selectedDate) => {
    if (selectedDate !== undefined) {
      setDate(selectedDate);
      setShowDatePicker(false);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    if (selectedTime !== undefined) {
      const formattedTime = `${selectedTime.getHours()}:${selectedTime.getMinutes()}`;
      setTime(formattedTime);
      setShowTimePicker(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={32} color="blue" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Event Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person" size={32} color="blue" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text>Event Type:</Text>
        <Picker
          selectedValue={eventType}
          onValueChange={(itemValue) => setEventType(itemValue)}
        >
          <Picker.Item label="Select Event Type" value="" />
          <Picker.Item label="Litter Picking" value="Litter Picking" />
          <Picker.Item label="Tree Plantation" value="Tree Plantation" />
          <Picker.Item label="Beach CleanUp" value="Beach CleanUp" />
          <Picker.Item label="Environmental Meet" value="Environmental Meet" />
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <Text>Date:</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text>{date.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text>Time:</Text>
        <TouchableOpacity onPress={() => setShowTimePicker(true)}>
          <Text>{time}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text>Description:</Text>
        <TextInput
          placeholder="Enter event description (250 characters max)"
          value={description}
          onChangeText={(text) => setDescription(text)}
          multiline
          maxLength={250}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Location:</Text>
        <TextInput
          placeholder="Enter event location"
          value={location}
          onChangeText={(text) => setLocation(text)}
        />
      </View>

      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Text style={[styles.postButtonText, { textTransform: 'uppercase', fontSize: 18 }]}>POST</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  postButton: {
    backgroundColor: 'blue',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignSelf: 'center',
  },
  postButtonText: {
    color: 'white',
    fontSize: 18,
  },
});
