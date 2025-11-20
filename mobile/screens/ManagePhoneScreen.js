import React, { useState, useContext, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FirebaseRecaptcha } from 'expo-firebase-recaptcha';
import { getAuth, PhoneAuthProvider, linkWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { app, db } from '../firebaseConfig';
import { ThemeContext } from '../context/ThemeContext';

export default function ManagePhoneScreen({ navigation }) {
  const auth = getAuth(app);
  const recaptchaVerifier = useRef(null);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const handleSendCode = async () => {
    if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
      setMessage({ text: "Please enter a valid phone number with a country code (e.g., +265...).", type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const verId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );
      setVerificationId(verId);
      setMessage({ text: `A verification code has been sent to ${phoneNumber}.`, type: 'success' });
    } catch (error) {
      console.error("Phone Auth Error:", error);
      setMessage({ text: "Failed to send verification code. Please try again.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!verificationCode) {
      setMessage({ text: "Please enter the verification code.", type: 'error' });
      return;
    }
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const user = auth.currentUser;

      // Link the phone credential to the existing user account
      await linkWithCredential(user, credential);

      // Update the phone number in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { phone: phoneNumber });

      Alert.alert("Success", "Your phone number has been successfully linked.");
      navigation.goBack();
    } catch (error) {
      console.error("Phone Link Error:", error);
      setMessage({ text: "Invalid verification code. Please try again.", type: 'error' });
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
        <Text style={styles.headerTitle}>Manage Phone Number</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.content}>
        {!verificationId ? (
          <>
            <Text style={styles.infoText}>
              Enter your phone number below to link it to your account. Please include your country code (e.g., +265).
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., +265 888 123 456"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Verification Code'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.infoText}>Enter the 6-digit code sent to your phone.</Text>
            <TextInput
              style={styles.input}
              placeholder="123456"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              value={verificationCode}
              onChangeText={setVerificationCode}
            />
            <TouchableOpacity style={styles.button} onPress={handleConfirmCode} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Confirm Code'}</Text>
            </TouchableOpacity>
          </>
        )}
        {message.text ? <Text style={[styles.message, message.type === 'error' ? styles.errorMessage : styles.successMessage]}>{message.text}</Text> : null}
        <FirebaseRecaptcha
          ref={recaptchaVerifier}
          firebaseConfig={app.options}
          containerStyle={{ marginTop: 20, alignSelf: 'center' }} // This makes it appear at the bottom of the content
        />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  content: { flex: 1, padding: 20 },
  infoText: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  input: {
    backgroundColor: theme.input,
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  button: { backgroundColor: theme.primary, padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  message: { textAlign: 'center', marginTop: 15, fontSize: 14 },
  errorMessage: { color: '#b71c1c' },
  successMessage: { color: '#2e7d32' },
});