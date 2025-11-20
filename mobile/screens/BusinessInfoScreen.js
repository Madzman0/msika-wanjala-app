// screens/BusinessInfoScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ThemeContext } from '../context/ThemeContext';

export default function BusinessInfoScreen({ navigation }) {
  const auth = getAuth();
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [businessName, setBusinessName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [tin, setTin] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().businessInfo) {
            const {
              name = '',
              registrationNumber = '',
              tin = '',
              address = ''
            } = userDoc.data().businessInfo;
            setBusinessName(name);
            setRegistrationNumber(registrationNumber);
            setTin(tin);
            setAddress(address);
          }
        } catch (error) {
          console.error("Error fetching business info:", error);
          Alert.alert("Error", "Could not load your business information.");
        } finally {
          setInitialLoading(false);
        }
      }
    };
    fetchBusinessInfo();
  }, []);

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        businessInfo: {
          name: businessName,
          registrationNumber,
          tin,
          address,
        },
      });
      Alert.alert("Success", "Your business information has been updated.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not update your business information.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Information</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Legal Business Name</Text>
        <TextInput style={styles.input} placeholder="e.g., Green Farm Ltd" value={businessName} onChangeText={setBusinessName} placeholderTextColor={theme.textSecondary} />
        <Text style={styles.label}>Business Registration Number</Text>
        <TextInput style={styles.input} placeholder="Your official registration number" value={registrationNumber} onChangeText={setRegistrationNumber} placeholderTextColor={theme.textSecondary} />
        <Text style={styles.label}>Taxpayer Identification Number (TIN)</Text>
        <TextInput style={styles.input} placeholder="Your MRA TIN" value={tin} onChangeText={setTin} placeholderTextColor={theme.textSecondary} />
        <Text style={styles.label}>Physical Business Address</Text>
        <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} placeholder="e.g., Plot 123, Area 4, Lilongwe" value={address} onChangeText={setAddress} multiline placeholderTextColor={theme.textSecondary} />
        <TouchableOpacity style={styles.button} onPress={handleSaveChanges} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  content: { padding: 20 },
  label: { fontSize: 15, fontWeight: '600', color: theme.textSecondary, marginBottom: 8 },
  input: { backgroundColor: theme.input, padding: 14, borderRadius: 8, fontSize: 16, color: theme.text, marginBottom: 16, borderWidth: 1, borderColor: theme.border },
  button: { backgroundColor: theme.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});