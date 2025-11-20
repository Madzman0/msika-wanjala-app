// screens/ChatScreen.js
import React, { useState, useEffect, useContext } from "react";
import { 
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function ChatScreen({ route, navigation }) {
  const { chatId, chatName = 'Chat', chatPhotoURL } = route.params;
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const auth = getAuth();
  const user = auth.currentUser;
  const flatListRef = useRef();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!chatId || !user) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [chatId]);

  const sendMessage = async () => {
    if (newMessage.trim() === "" || !user) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const chatRef = doc(db, "chats", chatId);

    try {
      // Add the new message to the 'messages' subcollection
      await addDoc(messagesRef, {
        text: newMessage,
        createdAt: serverTimestamp(),
        senderId: user.uid,
      });

      // Update the 'lastMessage' field on the parent chat document
      await updateDoc(chatRef, {
        lastMessage: newMessage,
        lastMessageAt: serverTimestamp(),
      });

      setNewMessage(""); // Clear the input field
    } catch (error) {
      console.error("Error sending message: ", error);
      Alert.alert("Error", "Could not send message.");
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.chatBubble,
        item.senderId === user?.uid ? styles.chatBubbleRight : styles.chatBubbleLeft,
      ]}
    >
      <Text style={styles.chatText}>{item.text}</Text>
      <Text style={styles.timeText}>
        {item.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'sending...'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Image
            source={{ uri: chatPhotoURL || `https://i.pravatar.cc/100?u=${chatId}` }}
            style={styles.avatar}
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.chatTitle}>{chatName}</Text>
            {/* You can add online status logic later */}
          </View>
        </View>

        {/* MESSAGES */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 10 }}
          onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
        />

        {/* INPUT */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={theme.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 5,
  },
  chatTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: theme.text,
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  chatBubbleLeft: {
    backgroundColor: theme.input,
    alignSelf: 'flex-start',
  },
  chatBubbleRight: {
    backgroundColor: theme.primary,
    alignSelf: 'flex-end',
  },
  chatText: {
    fontSize: 15,
    color: theme.text, // This will be overridden by the bubble color
  },
  timeText: {
    fontSize: 11,
    color: theme.textSecondary,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.card,
  },
  input: {
    flex: 1,
    backgroundColor: theme.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    maxHeight: 100,
    color: theme.text,
    fontSize: 15,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: theme.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});