import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { collection, query, where, getDocs, addDoc, doc, orderBy } from 'firebase/firestore';
import { auth, db } from './firebase';

function ChatScreen({ route }) {
  const [selectedUser, setSelectedUser] = useState(route.params.selectedUser);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef();

  const sendMessage = async () => {
    if (!selectedUser || !messageInput) {
      return;
    }

    const messageData = {
      senderId: auth.currentUser.uid,
      receiverId: selectedUser.id,
      content: messageInput,
      timestamp: new Date(),
    };

    const messagesCollection = collection(db, 'messages');
    await addDoc(messagesCollection, messageData);

    setMessageInput('');

    // Scroll to the bottom after sending a message
    scrollViewRef.current.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    const fetchMessages = async () => {
      const messagesCollection = collection(db, 'messages');
      const q = query(
        messagesCollection,
        where('senderId', 'in', [auth.currentUser.uid, selectedUser.id]),
        where('receiverId', 'in', [auth.currentUser.uid, selectedUser.id]),
        orderBy('timestamp')
      );
      const querySnapshot = await getDocs(q);
      const messageData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messageData.push({ id: doc.id, ...data });
      });
      setMessages(messageData);

      // Scroll to the bottom when messages are loaded
      scrollViewRef.current.scrollToEnd({ animated: true });
    };

    fetchMessages();
  }, [selectedUser]);

  return (
    <View style={styles.container}>
      {selectedUser && (
        <View>
          <Text style={styles.headerText}>Chat with: {selectedUser.displayName}</Text>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollViewContent}
            onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  {
                    alignSelf:
                      message.senderId === auth.currentUser.uid ? 'flex-end' : 'flex-start',
                  },
                ]}
              >
                <Text style={styles.messageText}>{message.content}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              value={messageInput}
              onChangeText={(text) => setMessageInput(text)}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    backgroundColor: '#EFEFEF',
    padding: 10,
    borderRadius: 8,
    maxWidth: '70%',
    marginVertical: 4,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#547225',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ChatScreen;
