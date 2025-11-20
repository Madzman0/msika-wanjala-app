import React, { useState, useContext } from 'react';
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
import { app, db } from '../firebaseConfig';
import { ThemeContext } from '../context/ThemeContext';

export default function BillingAddressScreen({ navigation }) {
  const auth = getAuth(app);
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Malawi');
  const [loading, setLoading] = useState(false);

  // In a real app, you'd fetch this from the user's profile
  useState(() => {
    const fetchAddress = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().billingAddress) {
          const { address, city, postalCode, country } = userDoc.data().billingAddress;
          setAddress(address || '');
          setCity(city || '');
          setPostalCode(postalCode || '');
          setCountry(country || 'Malawi');
        }
      }
    };
    fetchAddress();
  }, []);

  const handleSaveChanges = async () => {
    if (!address || !city || !postalCode || !country) {
      Alert.alert("Incomplete", "Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        billingAddress: { address, city, postalCode, country }
      });
      Alert.alert("Success", "Billing address updated.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not update billing address.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Billing Address</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput style={styles.input} placeholder="Address Line" value={address} onChangeText={setAddress} placeholderTextColor={theme.textSecondary} />
        <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} placeholderTextColor={theme.textSecondary} />
        <TextInput style={styles.input} placeholder="Postal Code" value={postalCode} onChangeText={setPostalCode} placeholderTextColor={theme.textSecondary} />
        <TextInput style={styles.input} placeholder="Country" value={country} onChangeText={setCountry} placeholderTextColor={theme.textSecondary} />
        <TouchableOpacity style={styles.button} onPress={handleSaveChanges} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Address</Text>}
        </TouchableOpacity>
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
  content: { padding: 20 },
  input: {
    backgroundColor: theme.input, padding: 14, borderRadius: 8, fontSize: 16,
    color: theme.text, marginBottom: 16, borderWidth: 1, borderColor: theme.border,
  },
  button: {
    backgroundColor: theme.primary, padding: 15, borderRadius: 8,
    alignItems: 'center', marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});