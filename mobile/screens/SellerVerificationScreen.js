// screens/SellerVerificationScreen.js
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

export default function SellerVerificationScreen({ navigation }) {
  const auth = getAuth();
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('unverified');
  const [fullName, setFullName] = useState('');
  const [locationDistrict, setLocationDistrict] = useState('');
  const [locationArea, setLocationArea] = useState('');
  const [homeVillage, setHomeVillage] = useState('');
  const [age, setAge] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchVerificationInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setPhoneNumber(userData.verificationInfo?.phoneNumber || userData.phone || '');
            setNationalId(userData.verificationInfo?.nationalId || '');
            setVerificationStatus(userData.verificationStatus || 'unverified');
            setFullName(userData.verificationInfo?.fullName || userData.name || '');
            setLocationDistrict(userData.verificationInfo?.locationDistrict || '');
            setLocationArea(userData.verificationInfo?.locationArea || '');
            setHomeVillage(userData.verificationInfo?.homeVillage || '');
            setAge(userData.verificationInfo?.age || '');
          }
        } catch (error) {
          console.error("Error fetching verification info:", error);
          Alert.alert("Error", "Could not load your verification information.");
        } finally {
          setInitialLoading(false);
        }
      }
    };
    fetchVerificationInfo();
  }, []);

  const handleSubmitForVerification = async () => {
    if (!fullName.trim() || !phoneNumber.trim() || !nationalId.trim() || !locationDistrict.trim() || !homeVillage.trim() || !age.trim()) {
      Alert.alert("Incomplete", "Please fill in all required fields to proceed.");
      return;
    }
    if (!agreedToTerms) {
      Alert.alert("Agreement Required", "You must agree to the terms and conditions before submitting your information.");
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        verificationInfo: {
          phoneNumber,
          nationalId,
          fullName,
          locationDistrict,
          locationArea,
          homeVillage,
          age,
          submittedAt: new Date(),
        },
        verificationStatus: 'pending', // Set status to pending for admin review
      });
      Alert.alert("Submitted", "Your verification details have been submitted for review.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not submit your details. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = () => {
    if (verificationStatus === 'verified') return { color: '#16a34a', text: 'Verified' };
    if (verificationStatus === 'pending') return { color: '#f59e0b', text: 'Pending Review' };
    return { color: '#ef4444', text: 'Unverified' };
  };

  const statusInfo = getStatusStyle();

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
        <Text style={styles.headerTitle}>Seller Verification</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusBox}>
          <Text style={styles.label}>Current Status:</Text>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
        </View>

        <Text style={styles.infoText}>
          To ensure a safe marketplace, all sellers must be verified. Please provide your phone number and National ID. This information will be cross-checked for authenticity.
        </Text>

        <Text style={styles.label}>Full Name (as on National ID)</Text>
        <TextInput style={styles.input} placeholder="e.g., John Banda" value={fullName} onChangeText={setFullName} placeholderTextColor={theme.textSecondary} />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} placeholder="e.g., 0888123456" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" placeholderTextColor={theme.textSecondary} />
        
        <Text style={styles.label}>National ID Number</Text>
        <TextInput style={styles.input} placeholder="Your official National ID number" value={nationalId} onChangeText={setNationalId} placeholderTextColor={theme.textSecondary} />

        <Text style={styles.label}>Current Location (District)</Text>
        <TextInput style={styles.input} placeholder="e.g., Lilongwe" value={locationDistrict} onChangeText={setLocationDistrict} placeholderTextColor={theme.textSecondary} />

        <Text style={styles.label}>Current Location (Area)</Text>
        <TextInput style={styles.input} placeholder="e.g., Area 47" value={locationArea} onChangeText={setLocationArea} placeholderTextColor={theme.textSecondary} />

        <Text style={styles.label}>Home Village (as on National ID)</Text>
        <TextInput style={styles.input} placeholder="e.g., T/A Malili, Lilongwe" value={homeVillage} onChangeText={setHomeVillage} placeholderTextColor={theme.textSecondary} />

        <Text style={styles.label}>Age</Text>
        <TextInput style={styles.input} placeholder="e.g., 28" value={age} onChangeText={setAge} keyboardType="number-pad" placeholderTextColor={theme.textSecondary} />

        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreedToTerms(!agreedToTerms)}>
          <Ionicons name={agreedToTerms ? 'checkbox' : 'square-outline'} size={24} color={theme.primary} />
          <Text style={styles.agreementText}>By submitting this information, I confirm that it is accurate and I accept responsibility for any consequences arising from false information.</Text>
        </TouchableOpacity>
        
        {verificationStatus !== 'verified' && (
          <TouchableOpacity style={styles.button} onPress={handleSubmitForVerification} disabled={loading || verificationStatus === 'pending'}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{verificationStatus === 'pending' ? 'Submission is Pending Review' : 'Submit for Verification'}</Text>}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  content: { padding: 20 },
  statusBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.input, padding: 12, borderRadius: 8, marginBottom: 16 },
  statusText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  infoText: { fontSize: 14, color: theme.textSecondary, marginBottom: 20, lineHeight: 20, textAlign: 'center' },
  label: { fontSize: 15, fontWeight: '600', color: theme.textSecondary, marginBottom: 8 },
  input: { backgroundColor: theme.input, padding: 14, borderRadius: 8, fontSize: 16, color: theme.text, marginBottom: 16, borderWidth: 1, borderColor: theme.border },
  button: { backgroundColor: theme.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  agreementText: { flex: 1, marginLeft: 12, color: theme.textSecondary, fontSize: 13, lineHeight: 18 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});