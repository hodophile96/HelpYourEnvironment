import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase'; // Import your Firebase configuration here

const GroupScreen = () => {
  const [createdGroups, setCreatedGroups] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Fetch the groups the user is part of
          const userGroupsCollection = collection(db, 'user_groups', user.uid, 'groups');
          const userGroupsQuery = query(userGroupsCollection);
          const userGroupsSnapshot = await getDocs(userGroupsQuery);
          const userGroupIds = userGroupsSnapshot.docs.map((doc) => doc.id);

          // Fetch the group details
          const groupsCollection = collection(db, 'groups');
          const groupsQuery = query(groupsCollection, where('__name__', 'in', userGroupIds));
          const unsubscribe = onSnapshot(groupsQuery, (snapshot) => {
            const groupData = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                name: data.name,
              };
            });

            setCreatedGroups(groupData);
          });

          // Unsubscribe from the snapshot listener when the component unmounts
          return () => unsubscribe();
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Groups</Text>
      <FlatList
        data={createdGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('GroupChat', { groupId: item.id })}>
            <View style={styles.listItem}>
              <Text>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity onPress={() => navigation.navigate('CreateGroup')}>
        <Text style={styles.createGroupButton}>Create New Group</Text>
      </TouchableOpacity>
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
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  createGroupButton: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 10,
  },
});

export default GroupScreen;
