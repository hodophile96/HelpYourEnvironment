import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet } from 'react-native';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { auth, db } from './firebase';

const ContactListScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    // Fetch user contacts when component mounts
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    // Check if there is a current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No user is signed in.');
      return;
    }

    // Fetch the user's contacts from Firestore
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDocs(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setContacts(userData.contacts || []);
    }
  };

  const fetchSuggestions = async () => {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('displayName', '>=', searchText));
    const querySnapshot = await getDocs(q);
    const suggestionsData = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      suggestionsData.push({ id: doc.id, displayName: data.displayName });
    });
    setSuggestions(suggestionsData);
  };

  const handleMessage = (selectedUser) => {
    // Navigate to ChatScreen and pass the selected user's data
    navigation.navigate('ChatScreen', { selectedUser });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search users..."
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
        style={styles.searchInput}
        onBlur={fetchSuggestions} // Fetch suggestions when the input is blurred
      />
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <Text style={styles.userName}>{item.displayName}</Text>
              <Button
                title="Message"
                onPress={() => handleMessage(item)}
              />
            </View>
          )}
        />
      )}
      {contacts.length > 0 && (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <Text style={styles.userName}>{item}</Text>
              <Button
                title="Message"
                onPress={() => handleMessage({ id: item, displayName: item })}
              />
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    fontSize: 18,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 16,
  },
});

export default ContactListScreen;
