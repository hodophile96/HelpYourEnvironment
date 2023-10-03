import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db, auth } from './firebase';

export default function GroupChat() {
  const navigation = useNavigation();
  const route = useRoute();
  const groupId = route.params?.groupId;
  const groupName = route.params?.groupName;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userNames, setUserNames] = useState({});

  // Function to fetch user display names based on their user IDs
  async function fetchUserNames(userIds) {
    const usersCollection = collection(db, 'users');
    const userDocs = await Promise.all(
      userIds.map(async (userId) => {
        const userDoc = await getDoc(doc(usersCollection, userId));
        return { id: userId, displayName: userDoc.data()?.displayName || 'Other User' };
      })
    );

    const userNames = {};
    userDocs.forEach((userDoc) => {
      userNames[userDoc.id] = userDoc.displayName;
    });

    return userNames;
  }

  // Subscribe to real-time updates when new messages arrive
  useEffect(() => {
    const messagesCollection = collection(db, 'messages');
    const messagesQuery = query(
      messagesCollection,
      where('groupId', '==', groupId),
      orderBy('createdAt')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messageData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt ? data.createdAt.toDate() : null; // Check if createdAt is not null
      
        return {
          id: doc.id,
          text: data.text,
          createdBy: data.createdBy,
          createdAt: createdAt, // Assign the value or null
        };
      });
      
      setMessages(messageData);

      // Fetch user names after messages are updated
      fetchUserNamesForMessages();
    });

    return () => unsubscribe();
  }, [groupId]);

  // Fetch user names for messages in the current group
  const fetchUserNamesForMessages = async () => {
    try {
      const userIds = messages.map((message) => message.createdBy);
      const names = await fetchUserNames(userIds);
      setUserNames(names);
    } catch (error) {
      console.error('Error fetching user names:', error);
    }
  };

  const sendMessage = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const messagesCollection = collection(db, 'messages');
        await addDoc(messagesCollection, {
          groupId,
          text: newMessage,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        });

        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.groupName}>{groupName}</Text>
        <View />
      </View>

      <ScrollView
        style={styles.messageContainer}
        contentContainerStyle={styles.messageContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.message,
              message.createdBy === auth.currentUser.uid
                ? styles.rightMessage
                : styles.leftMessage,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
            <Text style={styles.senderName}>
              {message.createdBy === auth.currentUser.uid
                ? 'You'
                : userNames[message.createdBy]}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message"
          value={newMessage}
          onChangeText={(text) => setNewMessage(text)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon name="send" size={24} color="green" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContent: {
    paddingTop: 8,
    paddingBottom: 60,
  },
  message: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 8,
    padding: 12,
    maxWidth: '70%',
  },
  leftMessage: {
    alignSelf: 'flex-start',
    marginLeft: 10,
    backgroundColor: '#EFEFEF',
  },
  rightMessage: {
    alignSelf: 'flex-end',
    marginRight: 10,
    backgroundColor: 'white',
  },
  messageText: {
    fontSize: 16,
  },
  senderName: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  sendButton: {
    padding: 8,
  },
});
