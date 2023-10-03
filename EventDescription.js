import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  uploadImageToFirebaseStorage
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import ImagePicker from 'react-native-image-crop-picker';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from './firebase';
import { request, PERMISSIONS } from 'react-native-permissions';
import { useNavigation, useRoute } from '@react-navigation/native';


export default function EventDescription() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Initialize location state with null
  const [location, setLocation] = useState(null);

  // Initialize other state variables as before
  const [eventType, setEventType] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Listen for changes in the location data prop
  useEffect(() => {
    if (route.params?.locationData) {
      // When location data is received, update the location state
      setLocation(route.params.locationData);
    }
  }, [route.params?.locationData]);

  const handleCreateEvent = async () => {
    if (!eventType || !date || !time || !description ) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error('No user is signed in.');
        return;
      }

      const displayName = currentUser.displayName || '';

      const eventsCollectionRef = collection(db, 'events');

      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImageToFirebaseStorage(selectedImage.path);
      }

      const eventData = {
        eventType,
        date,
        time,
        description,
        location, // Include the selected location
        createdBy: currentUser.uid,
        createdByDisplayName: displayName, 
        join: 0,
        like: 0,
        imageUrl,
      };

      await addDoc(eventsCollectionRef, eventData);

      setEventType('');
      setDescription('');
      setSelectedImage(null);

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

  const handleImageSelect = async () => {
    try {
      const permission = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);

      if (permission !== 'granted') {
        console.log('Permission not granted');
        return;
      }

      const image = await ImagePicker.openPicker({
        width: 800,
        height: 800,
        cropping: true,
      });

      setSelectedImage(image);
    } catch (error) {
      console.error('ImagePicker Error: ', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={32} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Create Event</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person" size={32} color="black" />
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

      
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => navigation.navigate('LocationSearch', { setLocation })}
      >
        <Text style={styles.label}>Location:</Text>
        {location ? (
          <Text style={styles.locationText}>
             {location.name}
          </Text>
        ) : (
          <Text style={styles.locationText}>Select Location</Text>
        )}
      </TouchableOpacity>


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
        <Text style={styles.label}>Image:</Text>
        <TouchableOpacity onPress={handleImageSelect}>
          <Text style={styles.selectImageText}>Select Image</Text>
        </TouchableOpacity>
        {selectedImage && (
          <Image
            source={{ uri: selectedImage.path }}
            style={styles.selectedImage}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.createEventButton}
        onPress={handleCreateEvent}
      >
        <Text style={styles.createEventButtonText}>Create</Text>
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
    color: 'black',
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
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    color: '#333',
    paddingVertical: 15,
  },
  timeText: {
    fontSize: 18,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    color: '#333',
    paddingVertical: 10,
  },
  descriptionInput: {
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    height: 80,
  },
  locationText: {
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  createEventButton: {
    backgroundColor: 'green',
    paddingVertical: 10,
    borderRadius: 15,
    alignSelf: 'center',
    marginTop: 20,
  },
  createEventButtonText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  selectedImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginTop: 10,
  },
  selectImageText: {
    fontSize: 18,
    color: 'blue',
    marginTop: 10,
  },
});




