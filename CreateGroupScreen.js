import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { auth, db, uploadImageToFirebaseStorage } from './firebase'; // Import Firebase configuration and functions

import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

const CreateGroupScreen = () => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // To store all users from Firestore

  useEffect(() => {
    // Fetch all users from Firestore when the component mounts
    const fetchAllUsers = async () => {
      try {
        const usersCollection = collection(db, 'users'); // Assuming you have a 'users' collection
        const usersSnapshot = await getDocs(usersCollection);
        const allUsersData = usersSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
          };
        });
        setAllUsers(allUsersData);
      } catch (error) {
        console.error('Error fetching all users:', error);
      }
    };
    fetchAllUsers();
  }, []);

  const searchUsers = () => {
    // Filter users based on the search query
    const filteredUsers = allUsers.filter((user) =>
      user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filteredUsers);
  };

  const addUserToGroup = (user) => {
    setSelectedUsers([...selectedUsers, user]);
  };

  const createGroup = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Replace with your Firestore setup
        const groupRef = collection(db, 'groups');
        const newGroupDoc = await addDoc(groupRef, {
          name: groupName,
          members: selectedUsers.map((user) => user.id), // Add selected users to the group
        });

        // Add the group to the user's groups
        const userGroupsRef = collection(db, 'user_groups', user.uid, 'groups');
        await setDoc(doc(userGroupsRef, newGroupDoc.id), {});

        // Clear the group name input and selected users
        setGroupName('');
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error('Error creating a group:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create New Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter group name"
        value={groupName}
        onChangeText={(text) => setGroupName(text)}
      />
      <Text style={styles.heading}>Search Users</Text>
      <TextInput
        style={styles.input}
        placeholder="Search for users"
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
        onEndEditing={searchUsers} // Trigger search when the user finishes typing
      />
      <Button title="Search" onPress={searchUsers} />
      <Text style={styles.heading}>Search Results</Text>
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => addUserToGroup(item)}>
            <View style={styles.listItem}>
              <Text>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Button title="Create Group" onPress={createGroup} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default CreateGroupScreen;
