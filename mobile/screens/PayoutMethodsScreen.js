// screens/PayoutMethodsScreen.js
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

export default function PayoutMethodsScreen({ navigation }) {
  const auth = getAuth();
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchPayoutDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().payoutDetails) {
            const { bankName = '', accountHolder = '', accountNumber = '' } = userDoc.data().payoutDetails;
            setBankName(bankName);
            setAccountHolder(accountHolder);
            setAccountNumber(accountNumber);
          }
        } catch (error) {
          console.error("Error fetching payout details:", error);
          Alert.alert("Error", "Could not load your payout information.");
        } finally {
          setInitialLoading(false);
        }
      }
    };
    fetchPayoutDetails();
  }, []);

  const handleSaveChanges = async () => {
    if (!bankName || !accountHolder || !accountNumber) {
      Alert.alert("Incomplete", "Please fill all bank detail fields.");
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        payoutDetails: { bankName, accountHolder, accountNumber },
      });
      Alert.alert("Success", "Your payout information has been updated.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not update your payout information.");
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
        <Text style={styles.headerTitle}>Payout Methods</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Bank Name</Text>
        <TextInput style={styles.input} placeholder="e.g., National Bank of Malawi" value={bankName} onChangeText={setBankName} placeholderTextColor={theme.textSecondary} />
        <Text style={styles.label}>Account Holder Name</Text>
        <TextInput style={styles.input} placeholder="Full name as it appears on your account" value={accountHolder} onChangeText={setAccountHolder} placeholderTextColor={theme.textSecondary} />
        <Text style={styles.label}>Account Number</Text>
        <TextInput style={styles.input} placeholder="Your bank account number" value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" placeholderTextColor={theme.textSecondary} />
        <TouchableOpacity style={styles.button} onPress={handleSaveChanges} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Payout Method</Text>}
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