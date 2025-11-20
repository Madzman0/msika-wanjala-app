// screens/LoginScreen.js
import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../firebaseConfig';
import { ThemeContext } from '../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const auth = getAuth(app);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Missing Fields", "Please enter both email and password.");
    }
    setLoading(true);
    try {
      // The onAuthStateChanged listener in App.js will handle navigation.
      await signInWithEmailAndPassword(auth, email, password);
      // Alert.alert("Success", "Login successful!"); // This is optional as the app will navigate away.
    } catch (err) {
      console.error(err);
      let errorMessage = "An unknown error occurred.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(isDarkMode);

  return (
    <View style={[styles.container]}>
      {/* Dark Mode Toggle */}
      <TouchableOpacity style={styles.modeToggle} onPress={toggleTheme}>
        {isDarkMode ? (
          <Ionicons name="sunny-outline" size={24} color="#ffcc00" />
        ) : (
          <Ionicons name="moon-outline" size={24} color="#444" />
        )}
      </TouchableOpacity>

      {/* Logo */}
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>Msika Wanjala</Text>
      </View>

      {/* Form Card */}
      <View style={styles.form}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={isDarkMode ? "#aaa" : "#555"}
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor={isDarkMode ? "#aaa" : "#555"}
          style={styles.input}
        />

        <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>New here? Create an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (isDarkMode) => {
  const theme = isDarkMode ? darkStyles : lightStyles;
  return theme;
};

// DARK THEME
const darkStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', padding: 20 },
  modeToggle: { position: 'absolute', top: 40, right: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 80, height: 80, marginBottom: 10, tintColor: '#fff' },
  appName: { fontSize: 20, fontWeight: 'bold', color: '#ff6f00' },
  form: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 10, marginHorizontal: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#ff6f00' },
  input: { borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 14, color: '#fff' },
  forgotPasswordButton: { alignSelf: 'flex-end', marginBottom: 15 },
  forgotPasswordText: { color: '#ff9800', fontSize: 14, fontWeight: 'bold', textAlign: 'right' },
  button: { backgroundColor: '#ff6f00', paddingVertical: 12, borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 14 },
  linkButton: { marginTop: 10 },
  linkText: { textAlign: 'center', color: '#ff9800', fontWeight: 'bold', fontSize: 14 },
});

// LIGHT THEME
const lightStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 20 },
  modeToggle: { position: 'absolute', top: 40, right: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 80, height: 80, marginBottom: 10 },
  appName: { fontSize: 20, fontWeight: 'bold', color: '#ff6f00' },
  form: { backgroundColor: '#f9f9f9', padding: 20, borderRadius: 10, elevation: 3, marginHorizontal: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#ff6f00' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 14 },
  forgotPasswordButton: { alignSelf: 'flex-end', marginBottom: 15 },
  forgotPasswordText: { color: '#ff6f00', fontSize: 14, fontWeight: 'bold', textAlign: 'right' },
  button: { backgroundColor: '#ff6f00', paddingVertical: 12, borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 14 },
  linkButton: { marginTop: 10 },
  linkText: { textAlign: 'center', color: '#ff6f00', fontWeight: 'bold', fontSize: 14 },
});
