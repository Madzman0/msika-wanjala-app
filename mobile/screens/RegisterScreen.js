import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { register } from '../api/auth';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('seller'); // default role
  const [darkMode, setDarkMode] = useState(false);

  const handleRegister = async () => {
    try {
      await register({ name, phone, password, role });
      Alert.alert('Success', 'Account created successfully');
      navigation.navigate('Login');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err?.response?.data?.msg || 'Registration failed');
    }
  };

  const theme = darkMode ? darkStyles : lightStyles;

  return (
    <View style={[theme.container]}>
      {/* Dark Mode Toggle */}
      <TouchableOpacity style={theme.modeToggle} onPress={() => setDarkMode(!darkMode)}>
        {darkMode ? (
          <Ionicons name="sunny-outline" size={24} color="#ffcc00" />
        ) : (
          <Ionicons name="moon-outline" size={24} color="#444" />
        )}
      </TouchableOpacity>

      {/* Logo */}
      <View style={theme.header}>
        <Image source={require('../assets/logo.png')} style={theme.logo} />
        <Text style={theme.appName}>Msika Wanjala</Text>
      </View>

      {/* Form Card */}
      <View style={theme.form}>
        <Text style={theme.title}>Register</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          placeholderTextColor={darkMode ? "#aaa" : "#555"}
          style={theme.input}
        />

        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone"
          placeholderTextColor={darkMode ? "#aaa" : "#555"}
          style={theme.input}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor={darkMode ? "#aaa" : "#555"}
          style={theme.input}
        />

        <TouchableOpacity style={theme.button} onPress={handleRegister}>
          <Text style={theme.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity style={theme.linkButton} onPress={() => navigation.navigate('Login')}>
          <Text style={theme.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// LIGHT THEME
const lightStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 20 },
  modeToggle: { position: 'absolute', top: 40, right: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 100, height: 100, resizeMode: 'contain', marginBottom: 10 },
  appName: { fontSize: 22, fontWeight: 'bold', color: '#ff6f00' },
  form: { backgroundColor: '#f9f9f9', padding: 25, borderRadius: 10, elevation: 3 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#ff6f00' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#ff6f00', paddingVertical: 15, borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  linkButton: { marginTop: 15 },
  linkText: { textAlign: 'center', color: '#ff6f00', fontWeight: 'bold' },
});

// DARK THEME
const darkStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', padding: 20 },
  modeToggle: { position: 'absolute', top: 40, right: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 100, height: 100, resizeMode: 'contain', marginBottom: 10, tintColor: '#fff' },
  appName: { fontSize: 22, fontWeight: 'bold', color: '#ff6f00' },
  form: { backgroundColor: '#1e1e1e', padding: 25, borderRadius: 10 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#ff6f00' },
  input: { borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16, color: '#fff' },
  button: { backgroundColor: '#ff6f00', paddingVertical: 15, borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  linkButton: { marginTop: 15 },
  linkText: { textAlign: 'center', color: '#ff9800', fontWeight: 'bold' },
});
