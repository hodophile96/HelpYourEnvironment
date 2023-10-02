import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icon

const GroupScreen = () => {
  const [createdGroups, setCreatedGroups] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userGroupsCollection = collection(db, 'user_groups', user.uid, 'groups');
          const userGroupsQuery = query(userGroupsCollection);
          const userGroupsSnapshot = await getDocs(userGroupsQuery);
          const userGroupIds = userGroupsSnapshot.docs.map((doc) => doc.id);

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
          <TouchableOpacity
            onPress={() => navigation.navigate('GroupChat', { groupId: item.id })}
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
