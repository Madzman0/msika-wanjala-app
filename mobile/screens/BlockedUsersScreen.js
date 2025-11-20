import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

// Dummy Data for demonstration
const BLOCKED_USERS_DATA = [
  { id: 'u1', name: 'Annoying Seller', avatar: 'https://i.pravatar.cc/150?u=u1' },
  { id: 'u2', name: 'Spammy User', avatar: 'https://i.pravatar.cc/150?u=u2' },
  { id: 'u3', name: 'Bad Deals Inc.', avatar: 'https://i.pravatar.cc/150?u=u3' },
];

export default function BlockedUsersScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [blockedUsers, setBlockedUsers] = useState(BLOCKED_USERS_DATA);

  const handleUnblock = (userToUnblock) => {
    Alert.alert(
      "Unblock User",
      `Are you sure you want to unblock ${userToUnblock.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unblock",
          style: "destructive",
          onPress: () => {
            setBlockedUsers(prev => prev.filter(user => user.id !== userToUnblock.id));
            // In a real app, you would also make an API call here to update the backend.
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blocked Users</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {blockedUsers.length > 0 ? (
          blockedUsers.map(user => (
            <View key={user.id} style={styles.userRow}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              <Text style={styles.userName}>{user.name}</Text>
              <TouchableOpacity style={styles.unblockButton} onPress={() => handleUnblock(user)}>
                <Text style={styles.unblockButtonText}>Unblock</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>You haven't blocked any users.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 15, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  scrollContainer: { padding: 16 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  unblockButton: {
    borderColor: theme.primary,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  unblockButtonText: {
    color: theme.primary,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: theme.textSecondary,
    fontSize: 16,
  },
});