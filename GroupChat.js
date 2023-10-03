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
} from 'firebase/firestore';
import { db, auth } from './firebase';

export default function GroupChat() {
  const navigation = useNavigation();
  const route = useRoute();
  const groupId = route.params?.groupId;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time updates when new messages arrive
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
      
    });

    return () => unsubscribe();
  }, [groupId]);

  const fetchMessages = async () => {
    try {
      // Fetch existing messages for the group
      const messagesCollection = collection(db, 'messages');
      const messagesQuery = query(
        messagesCollection,
        where('groupId', '==', groupId),
        orderBy('createdAt')
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      const messageData = messagesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          createdBy: data.createdBy,
          createdAt: data.createdAt.toDate(),
        };
      });
      setMessages(messageData);
    } catch (error) {
      console.error('Error fetching messages:', error);
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.groupName}>Group Chat</Text>
        <View />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.message}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />

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
  message: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    padding: 12,
    alignSelf: 'flex-start',
    maxWidth: '70%',
  },
  messageText: {
    fontSize: 16,
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
