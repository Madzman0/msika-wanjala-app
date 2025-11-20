// screens/PrivacyPolicyScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

export default function PrivacyPolicyScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Last Updated: [Date]</Text>
        <Text style={styles.paragraph}>
          Welcome to Msika Wanjala. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
        </Text>
        <Text style={styles.subHeader}>1. INFORMATION WE COLLECT</Text>
        <Text style={styles.paragraph}>
          We collect personal information that you voluntarily provide to us when you register on the app, express an interest in obtaining information about us or our products and services, when you participate in activities on the app or otherwise when you contact us.
        </Text>
        <Text style={styles.subHeader}>2. HOW WE USE YOUR INFORMATION</Text>
        <Text style={styles.paragraph}>
          We use personal information collected via our app for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
        </Text>
        {/* Add more sections as needed */}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  content: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 10 },
  subHeader: { fontSize: 15, fontWeight: 'bold', color: theme.text, marginTop: 16, marginBottom: 8 },
  paragraph: { fontSize: 15, color: theme.textSecondary, lineHeight: 22 },
});