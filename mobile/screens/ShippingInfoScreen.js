// screens/ShippingInfoScreen.js
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

export default function ShippingInfoScreen({ navigation }) {
  const auth = getAuth();
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [shippingInfo, setShippingInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchShippingInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setShippingInfo(userData.shippingInfo || '');
          }
        } catch (error) {
          console.error("Error fetching shipping info:", error);
          Alert.alert("Error", "Could not load your shipping information.");
        } finally {
          setInitialLoading(false);
        }
      }
    };
    fetchShippingInfo();
  }, []);

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        shippingInfo: shippingInfo,
      });
      Alert.alert("Success", "Your shipping information has been updated.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not update your shipping information.");
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
        <Text style={styles.headerTitle}>Shipping Information</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Shipping Policy</Text>
        <TextInput
          style={[styles.input, { height: 200, textAlignVertical: 'top' }]}
          placeholder="Describe your shipping methods, costs, and estimated delivery times..."
          value={shippingInfo}
          onChangeText={setShippingInfo}
          placeholderTextColor={theme.textSecondary}
          multiline
        />
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