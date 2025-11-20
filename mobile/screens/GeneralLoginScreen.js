// GeneralLoginScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { app, db } from '../firebaseConfig';
import { ThemeContext } from '../context/ThemeContext';

export default function GeneralLoginScreen({ navigation }) {
  const auth = getAuth(app);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: '', type: '' }); // For success/error messages
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const handleLogin = async () => {
    if (!email || !password) {
      return setMessage({ text: 'Please enter both email and password.', type: 'error' });
    }
 
    setMessage({ text: '', type: '' }); // Clear previous messages
    setLoading(true);
    try {
      // 1. Authenticate the user.
      await signInWithEmailAndPassword(auth, email, password);
      // 2. If successful, the onAuthStateChanged listener in App.js will automatically
      //    fetch the user's role and navigate to the correct home screen.
      // 3. Show a success message here.
      setMessage({ text: 'Login success!', type: 'success' });
    } catch (error) {
      // 3. Handle authentication errors (e.g., wrong password, network issues)
      console.error("Firebase Login Error:", error); // Log the full error object
      // Provide a user-friendly error message for invalid credentials.
      setMessage({ text: 'Invalid email or password.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      return setMessage({ text: 'Please enter your email address first.', type: 'error' });
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage({ text: `Password reset email sent to ${email}. Please check your inbox.`, type: 'success' });
    } catch (error) {
      console.error("Forgot Password Error:", error);
      setMessage({ text: 'Failed to send reset email. Please check the address and try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // After successful Google sign-in, check if user exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // If it's a new user, create a document for them in Firestore
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          phone: user.phoneNumber || "", // Google may not provide a phone number
          role: "buyer", // Default role for new social sign-ups
          createdAt: new Date(),
        });
      }
      // The onAuthStateChanged listener in App.js will handle navigation
      setMessage({ text: 'Login success!', type: 'success' });
    } catch (error) {
      console.error("Google Login Error:", error);
      setMessage({ text: 'Google login failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    const provider = new FacebookAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // After successful Facebook sign-in, check if user exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // If it's a new user, create a document for them in Firestore
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          phone: user.phoneNumber || "", // Facebook may not provide a phone number
          role: "buyer", // Default role for new social sign-ups
          createdAt: new Date(),
        });
      }
      // The onAuthStateChanged listener in App.js will handle navigation
      setMessage({ text: 'Login success!', type: 'success' });
    } catch (error) {
      console.error("Facebook Login Error:", error);
      setMessage({ text: 'Facebook login failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(isDarkMode);
  return ( <View style={styles.container}>
      {/* Dark Mode Toggle */}
      <TouchableOpacity style={styles.modeToggle} onPress={toggleTheme}>
        {isDarkMode ? (
          <Ionicons name="sunny-outline" size={24} color="#ffcc00" />
        ) : (
          <Ionicons name="moon-outline" size={24} color="#444" />
        )}
      </TouchableOpacity>
      {/* Header Branding */}
      <View style={styles.header}>
        <Ionicons name="storefront-outline" size={60} color="#ff6f00" style={{ marginBottom: 10 }} />
        <Text style={styles.appName}>Msika Wanjala</Text>
        <Text style={styles.subtitle}>Welcome back! Please login to continue</Text>
      </View>

      {/* Responsive Container for the form and social buttons */}
      <View style={[styles.formContainer, width > 768 && styles.desktopFormContainer]}>
        {/* Login Card */}
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Dynamic Message Display */}
          {message.text ? (
            <Text style={[styles.message, message.type === 'success' ? styles.successMessage : styles.errorMessage]}>
              {message.text}
            </Text>
          ) : null}

          <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.orText}>or continue with</Text>

        {/* Social Buttons */}
        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin} disabled={loading}>
          <Ionicons name="logo-google" size={20} color="#fff" />
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin} disabled={loading}>
          <Ionicons name="logo-facebook" size={20} color="#fff" />
          <Text style={styles.socialText}>Facebook</Text>
        </TouchableOpacity>
      </View>

      {/* Links */}
      <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
        <Text style={styles.registerText}>
          Don’t have an account?{" "}
          <Text style={{ color: "#ff6f00", fontWeight: "600" }}>Sign up</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("VendorLogin")}>
        <Text style={styles.vendorLoginText}>
          Are you a Vendor?{" "}
          <Text style={{ color: "#ff6f00", fontWeight: "600" }}>
            Login as Vendor
          </Text>
        </Text>
      </TouchableOpacity>
    </View>);
}

const getStyles = (isDarkMode) => {
  const base = {
    header: { alignItems: "center", marginBottom: 20 },
    appName: { fontSize: 22, fontWeight: "bold", color: "#ff6f00" },
    formContainer: { width: '100%' },
    desktopFormContainer: { maxWidth: 500, alignSelf: 'center' },
    message: { textAlign: 'center', fontSize: 14, marginVertical: 10 },
    successMessage: { color: '#2e7d32', fontWeight: 'bold' },
    errorMessage: { color: '#b71c1c', fontWeight: 'bold' },
    loginButton: { backgroundColor: "#ff6f00", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 10 },
    loginText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    orText: { textAlign: "center", marginVertical: 10, fontSize: 14 },
    socialButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 8,
      marginVertical: 6,
      justifyContent: "center",
      width: "100%",
    },
    socialText: { fontWeight: "bold", marginLeft: 8, fontSize: 15 },
    registerText: { marginTop: 20, fontSize: 14, textAlign: "center" },
    vendorLoginText: { marginTop: 12, fontSize: 14, textAlign: "center" },
    modeToggle: { position: 'absolute', top: 40, right: 20, zIndex: 1 },
  };

  if (isDarkMode) {
    return StyleSheet.create({
      ...base,
      container: { flex: 1, backgroundColor: "#121212", padding: 20, justifyContent: "center" },
      subtitle: { fontSize: 14, color: "#b0b0b0", marginTop: 4, textAlign: "center" },
      card: { backgroundColor: "#1e1e1e", padding: 20, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4, marginBottom: 16 },
      input: { backgroundColor: "#333", padding: 12, borderRadius: 8, marginVertical: 8, width: '100%', fontSize: 15, color: "#fff" },
      forgotText: { alignSelf: "flex-end", color: "#ff9800", fontWeight: "600", fontSize: 14, marginVertical: 6 },
      orText: { ...base.orText, color: "#888" },
      socialButton: { ...base.socialButton, backgroundColor: "#333" },
      socialText: { ...base.socialText, color: "#fff" },
      registerText: { ...base.registerText, color: "#b0b0b0" },
      vendorLoginText: { ...base.vendorLoginText, color: "#b0b0b0" },
    });
  }

  return StyleSheet.create({
    ...base,
    container: { flex: 1, backgroundColor: "#f9fafb", padding: 20, justifyContent: "center" },
    subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4, textAlign: "center" },
    card: { backgroundColor: "#ffffff", padding: 20, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 4, marginBottom: 16 },
    input: { backgroundColor: "#f3f4f6", padding: 12, borderRadius: 8, marginVertical: 8, width: '100%', fontSize: 15, color: "#1f2937" },
    forgotText: { alignSelf: "flex-end", color: "#ff6f00", fontWeight: "600", fontSize: 14, marginVertical: 6 },
    orText: { ...base.orText, color: "#9ca3af" },
    socialButton: { ...base.socialButton, backgroundColor: "#e5e7eb" },
    socialText: { ...base.socialText, color: "#374151" },
    registerText: { ...base.registerText, color: "#6b7280" },
    vendorLoginText: { ...base.vendorLoginText, color: "#6b7280" },
  });
};
const styles = StyleSheet.create({
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333", // Updated color to match theme
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    justifyContent: "center",
    width: "100%",
  },
});
