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
import { LinearGradient } from "expo-linear-gradient"; // Add gradient support

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
      style={{ flex: 1, backgroundColor: "#f8f9fa" }} // Updated background color
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* HEADER */}
      <LinearGradient
        colors={["#ff6f00", "#ff8f00"]} // Gradient background
        style={styles.header}
      >
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
      </LinearGradient>

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
          placeholderTextColor="#aaa" // Updated placeholder color
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

// Updated styles
const styles = StyleSheet.create({
  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    elevation: 4,
    borderBottomLeftRadius: 10, // Rounded corners
    borderBottomRightRadius: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginLeft: 5,
    backgroundColor: "#ddd", // Placeholder background
  },
  chatTitle: { color: "#fff", fontSize: 18, fontWeight: "600" }, // Modern font weight
  status: { color: "#ffe0b2", fontSize: 13 },
  chatBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 20,
    marginVertical: 6,
    shadowColor: "#000", // Subtle shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    backgroundColor: "#ffcc80",
    borderTopRightRadius: 0,
  },
  chatText: { fontSize: 16, color: "#333" }, // Updated font size and color
  timeText: {
    fontSize: 11,
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
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    shadowColor: "#000", // Subtle shadow
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 25, // Rounded corners
    backgroundColor: "#f1f1f1",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ff6f00",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: "#000", // Subtle shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
});
