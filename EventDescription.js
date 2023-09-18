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

  const handleCreateEvent = async () => {
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
        join: 0, // Initialize join count to 0
        like: 0, // Initialize like count to 0
      });

      // Clear input fields
      setEventType('');
      setDescription('');
      setLocation('');

      // Navigate to the Feed Page after creating the event
      navigation.navigate('Feed');
    } catch (error) {
      console.error('Error creating event:', error);
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
          <Ionicons name="arrow-back" size={32} color="green" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Create Event</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person" size={32} color="green" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Event Type:</Text>
        <Picker
          selectedValue={eventType}
          onValueChange={(itemValue) => setEventType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Event Type" value="" />
          <Picker.Item label="Litter Picking" value="Litter Picking" />
          <Picker.Item label="Tree Plantation" value="Tree Plantation" />
          <Picker.Item label="Beach CleanUp" value="Beach CleanUp" />
          <Picker.Item label="Environmental Meet" value="Environmental Meet" />
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date:</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>{date.toDateString()}</Text>
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
        <Text style={styles.label}>Time:</Text>
        <TouchableOpacity onPress={() => setShowTimePicker(true)}>
          <Text style={styles.timeText}>{time}</Text>
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
        <Text style={styles.label}>Description:</Text>
        <TextInput
          placeholder="Enter event description (250 characters max)"
          value={description}
          onChangeText={(text) => setDescription(text)}
          multiline
          maxLength={250}
          style={styles.descriptionInput}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Location:</Text>
        <TextInput
          placeholder="Enter event location"
          value={location}
          onChangeText={(text) => setLocation(text)}
          style={styles.locationInput}
        />
      </View>

      <TouchableOpacity style={styles.createEventButton} onPress={handleCreateEvent}>
        <Text style={styles.createEventButtonText}>Create Event</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'green',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    color: '#333',
  },
  picker: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 18,
    color: '#333',
    paddingVertical: 10,
  },
  timeText: {
    fontSize: 18,
    color: '#333',
    paddingVertical: 10,
  },
  descriptionInput: {
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    height: 120,
  },
  locationInput: {
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  createEventButton: {
    backgroundColor: 'green',
    paddingVertical: 20,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 20,
  },
  createEventButtonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});