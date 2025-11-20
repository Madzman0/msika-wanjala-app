import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

// Dummy Data for demonstration
const SESSIONS_DATA = [
  { id: '1', device: 'Chrome on Windows', location: 'Lilongwe, Malawi', lastActive: 'Active now', isCurrent: true },
  { id: '2', device: 'iPhone 14 Pro', location: 'Blantyre, Malawi', lastActive: '2 hours ago', isCurrent: false },
  { id: '3', device: 'Android SDK built for x86', location: 'Zomba, Malawi', lastActive: '1 day ago', isCurrent: false },
];

export default function LoginActivityScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [sessions, setSessions] = useState(SESSIONS_DATA);

  const handleSignOut = (sessionToSignOut) => {
    Alert.alert(
      "Sign Out of Session",
      `Are you sure you want to sign out of the session on ${sessionToSignOut.device}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            setSessions(prev => prev.filter(session => session.id !== sessionToSignOut.id));
            // In a real app, you would make an API call here to invalidate this session token.
            Alert.alert("Session Signed Out", `The session on ${sessionToSignOut.device} has been signed out.`);
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
        <Text style={styles.headerTitle}>Login Activity</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.infoText}>
          This is a list of devices that have logged into your account. Sign out any sessions you don't recognize.
        </Text>
        {sessions.map(session => (
          <View key={session.id} style={styles.sessionCard}>
            <Ionicons name={session.device.includes('Windows') ? 'desktop-outline' : 'phone-portrait-outline'} size={32} color={theme.text} />
            <View style={styles.sessionDetails}>
              <Text style={styles.deviceText}>{session.device}</Text>
              <Text style={styles.locationText}>{session.location}</Text>
              <Text style={[styles.statusText, session.isCurrent && styles.currentStatusText]}>{session.lastActive}</Text>
            </View>
            {!session.isCurrent && (
              <TouchableOpacity style={styles.signOutButton} onPress={() => handleSignOut(session)}>
                <Text style={styles.signOutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
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
  infoText: {
    fontSize: 14, color: theme.textSecondary, textAlign: 'center',
    marginBottom: 20, lineHeight: 20,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sessionDetails: {
    flex: 1,
    marginLeft: 16,
  },
  deviceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  locationText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  statusText: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 4,
  },
  currentStatusText: {
    color: '#22c55e', // Green for active
    fontWeight: 'bold',
  },
  signOutButton: {
    borderColor: '#ef4444',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  signOutButtonText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 12,
  },
});