import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { ThemeContext } from "../context/ThemeContext";

const MessagesView = ({ messages }) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Messages</Text>
      {messages.map(m => (
        <View key={m.id} style={styles.messageRow}>
          <View style={styles.messageAvatar}><Text>{m.from.charAt(0)}</Text></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontWeight: 'bold' }}>{m.from}</Text>
            <Text style={{ color: '#666' }}>{m.text}</Text>
          </View>
          {m.unread && <View style={styles.unreadBadge}><Text style={{ color: '#fff', fontSize: 10 }}>New</Text></View>}
        </View>
      ))}
    </SafeAreaView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" }, // Re-using general container style
  header: { fontSize: 22, fontWeight: "700", marginBottom: 16, color: "#111827" },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomColor: "#f3f4f6",
    borderBottomWidth: 1,
  },
  messageAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  unreadBadge: { backgroundColor: "#ef4444", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
});

export default MessagesView;