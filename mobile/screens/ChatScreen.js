import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Store chat history per chatId
const chatHistories = {};

export default function ChatScreen({ route, navigation }) {
  const { chatId, chatName } = route.params;

  const [messages, setMessages] = useState(
    chatHistories[chatId] || [
      { id: 1, text: "Hi 👋", sender: "other", time: "10:00" },
      { id: 2, text: "Hello! How are you?", sender: "me", time: "10:01" },
    ]
  );

  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    chatHistories[chatId] = messages;
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    const msg = {
      id: messages.length + 1,
      text: newMessage,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...messages, msg]);
    setNewMessage("");

    // Optional fake reply
    setTimeout(() => {
      const reply = {
        id: messages.length + 2,
        text: "Got it ✅",
        sender: "other",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.chatBubble,
        item.sender === "me" ? styles.chatBubbleRight : styles.chatBubbleLeft,
      ]}
    >
      <Text style={styles.chatText}>{item.text}</Text>
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fdfdfd" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image
          source={{ uri: "https://i.pravatar.cc/100?img=5" }}
          style={styles.avatar}
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.chatTitle}>{chatName}</Text>
          <Text style={styles.status}>Online</Text>
        </View>
      </View>

      {/* MESSAGES */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
      />

      {/* INPUT */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 65,
    backgroundColor: "#ff6f00",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    elevation: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 5,
  },
  chatTitle: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  status: { color: "#ffe0b2", fontSize: 12 },
  chatBubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 16,
    marginVertical: 4,
  },
  chatBubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: "#eee",
  },
  chatBubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: "#ffe0b2",
    borderTopRightRadius: 0,
  },
  chatText: { fontSize: 15, color: "#000" },
  timeText: {
    fontSize: 10,
    color: "gray",
    alignSelf: "flex-end",
    marginTop: 2,
  },
  inputRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 6,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
    fontSize: 15,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#ff6f00",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
});
