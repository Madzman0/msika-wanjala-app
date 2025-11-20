// screens/TermsOfServiceScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

export default function TermsOfServiceScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Last Updated: [Date]</Text>
        <Text style={styles.paragraph}>
          Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Msika Wanjala mobile application (the "Service") operated by us.
        </Text>
        <Text style={styles.subHeader}>1. AGREEMENT TO TERMS</Text>
        <Text style={styles.paragraph}>
          By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
        </Text>
        <Text style={styles.subHeader}>2. ACCOUNTS</Text>
        <Text style={styles.paragraph}>
          When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
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