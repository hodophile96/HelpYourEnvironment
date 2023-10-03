import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icon

const GroupScreen = () => {
  const [userGroups, setUserGroups] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Query 'groups' to get the groups where the signed-in user is a member
          const groupsCollection = collection(db, 'groups');
          const groupsQuery = query(groupsCollection, where('members', 'array-contains', user.uid));
          const groupsSnapshot = await getDocs(groupsQuery);

          const userGroupsData = groupsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
            };
          });

          setUserGroups(userGroupsData);
        }
      } catch (error) {
        console.error('Error fetching user groups:', error);
      }
    };

    fetchUserGroups();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Groups</Text>
      <FlatList
        data={userGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('GroupChat', { groupId: item.id, groupName: item.name })}
          >
            <View style={styles.listItem}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Icon name="comments" size={20} color="green" />
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.createGroupButton}
        onPress={() => navigation.navigate('CreateGroup')}
      >
        <Text style={styles.createGroupButtonText}>Create New Group</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  createGroupButton: {
    backgroundColor: 'green',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createGroupButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default GroupScreen;
