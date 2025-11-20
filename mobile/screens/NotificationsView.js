import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const NotificationsView = ({ notifications = [], markNotificationRead = () => {} }) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      {notifications.length === 0 ? (
        <Text style={styles.placeholder}>No notifications yet.</Text>
      ) : (
        notifications.map(n => (
          <TouchableOpacity key={n.id} style={styles.notificationRow} onPress={() => markNotificationRead(n.id)}>
            <Text style={{ fontWeight: n.read ? 'normal' : 'bold' }}>{n.text}</Text>
          </TouchableOpacity>
        ))
      )}
    </SafeAreaView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" }, // Re-using general container style
  header: { fontSize: 22, fontWeight: "700", marginBottom: 16, color: "#111827" },
  placeholder: { color: "#9ca3af", textAlign: "center", marginTop: 28 },
  notificationRow: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default NotificationsView;