// screens/EditShopProfileScreen.js
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

export default function EditShopProfileScreen({ navigation }) {
  const auth = getAuth();
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [shopName, setShopName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchShopProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setShopName(userData.name || '');
            setSlogan(userData.slogan || '');
          }
        } catch (error) {
          console.error("Error fetching shop profile:", error);
          Alert.alert("Error", "Could not load your shop profile.");
        } finally {
          setInitialLoading(false);
        }
      }
    };
    fetchShopProfile();
  }, []);

  const handleSaveChanges = async () => {
    if (!shopName.trim()) {
      Alert.alert("Incomplete", "Shop name cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        name: shopName,
        slogan: slogan,
      });
      Alert.alert("Success", "Your shop profile has been updated.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not update your shop profile.");
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
        <Text style={styles.headerTitle}>Edit Shop Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Shop Name</Text>
        <TextInput style={styles.input} placeholder="Your Shop Name" value={shopName} onChangeText={setShopName} placeholderTextColor={theme.textSecondary} />
        <Text style={styles.label}>Slogan</Text>
        <TextInput style={styles.input} placeholder="Your catchy shop slogan" value={slogan} onChangeText={setSlogan} placeholderTextColor={theme.textSecondary} />
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