// SignUpScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; // Import Firebase Auth functions
import { app, db } from '../firebaseConfig'; // Import db from firebaseConfig
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions
import { ThemeContext } from '../context/ThemeContext';

export default function SignupScreen({ navigation }) {
  // Note: 'db' is now imported from firebaseConfig and ready to use
  const auth = getAuth(app); // Initialize Firebase Auth
  const [role, setRole] = useState("Buyer"); // Default to Buyer
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Function to generate a unique member ID
  const generateMemberId = (uid) => {
    const prefix = "mw";
    const uniquePart = uid.substring(0, 8).toLowerCase();
    return `${prefix}-${uniquePart}`;
  };

  const handleRegister = async () => {
    const { name, email, phone, password } = formData;
    if (!name || !email || !phone || !password) {
      return Alert.alert("Missing Fields", "Please fill in all required fields (Name, Email, Phone, Password).");
    }

    setLoading(true);
    try {
      // 1. Firebase authentication: Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Generate the unique member ID
      const memberId = generateMemberId(user.uid);

      const userData = {
        name: name,
        email: email,
        phone: phone,
        memberId: memberId, // Save the new member ID
        roles: [role.toLowerCase()], // Use a 'roles' array for consistency
        createdAt: new Date(),
      };

      // 2. After successful authentication, store additional user data in Firestore
      // We create a document in the 'users' collection with the user's UID as the document ID.
      await setDoc(doc(db, "users", user.uid), userData);

      setSuccess(true);
      Alert.alert("Registration Successful", `Welcome, ${name}! Your account has been created.`);
      // 3. Redirect to login after a short delay
      setTimeout(() => {
        setSuccess(false);
        navigation.navigate("Welcome"); // Navigate to Welcome, let the user login manually
      }, 2000);
    } catch (error) {
      console.error("Firebase Registration Error:", error);
      let errorMessage = "An unknown error occurred during registration.";
      if (error.code) {
        // Handle common Firebase Auth error codes
        errorMessage = error.message.replace('Firebase: ', ''); // Clean up Firebase prefix
      }
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigation.replace("Welcome");

  const renderFields = () => {
    const styles = getStyles(isDarkMode); // get styles inside render
    const commonStyle = styles.input;
    switch (role) {
      case "Buyer":
        return (
          <>
            <TextInput placeholder="Full Name" style={commonStyle} onChangeText={(v) => handleChange("name", v)} />
            <TextInput placeholder="Email" style={commonStyle} keyboardType="email-address" autoCapitalize="none" onChangeText={(v) => handleChange("email", v)} placeholderTextColor={isDarkMode ? '#888' : '#999'} />
            <TextInput placeholder="Phone Number" style={commonStyle} keyboardType="phone-pad" onChangeText={(v) => handleChange("phone", v)} />
            <TextInput placeholder="Password" style={commonStyle} secureTextEntry onChangeText={(v) => handleChange("password", v)} />
          </>
        );
      case "Seller":
      case "Transporter":
        return (
          <>
            <TextInput placeholder="Full Name" style={commonStyle} onChangeText={(v) => handleChange("name", v)} />
            <TextInput placeholder="Email" style={commonStyle} keyboardType="email-address" autoCapitalize="none" onChangeText={(v) => handleChange("email", v)} placeholderTextColor={isDarkMode ? '#888' : '#999'} />
            <TextInput placeholder="Phone Number" style={commonStyle} keyboardType="phone-pad" onChangeText={(v) => handleChange("phone", v)} />
            <TextInput placeholder="Password" style={commonStyle} secureTextEntry onChangeText={(v) => handleChange("password", v)} />
            <Text style={styles.approvalNote}>
              Note: {role} accounts require admin approval after registration.
            </Text>
          </>
        );
      default:
        return null;
    }
  };

  const styles = getStyles(isDarkMode);

  return (
    <View style={styles.container}>
      {/* Dark Mode Toggle */}
      <TouchableOpacity style={styles.modeToggle} onPress={toggleTheme}>
        {isDarkMode ? (
          <Ionicons name="sunny-outline" size={24} color="#ffcc00" />
        ) : (
          <Ionicons name="moon-outline" size={24} color="#444" />
        )}
      </TouchableOpacity>


      <View style={[
        styles.card,
        width > 768 && { maxWidth: 500, alignSelf: 'center', width: '100%' } // Apply this style on larger screens
      ]}>
        <Text style={styles.title}>Create an Account</Text>

        {/* Role Selector */}
        <View style={styles.roleContainer}>
          {["Buyer", "Seller", "Transporter"].map((r) => (
            <TouchableOpacity
              key={r}
              style={styles.roleWrapper}
              onPress={() => setRole(r)}
            >
              <View style={[styles.radio, role === r && styles.radioActive]}>
                {role === r && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.roleText}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {success && (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={40} color="green" />
            <Text style={styles.successText}>Registered as {role}!</Text>
          </View>
        )}

        {!success && renderFields()}

        {!success && (
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#777" }]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const getStyles = (isDarkMode) => {
  const theme = {
    background: isDarkMode ? "#121212" : "#f9fafb",
    card: isDarkMode ? "#1e1e1e" : "#ffffff",
    text: isDarkMode ? "#f0f0f0" : "#1f2937",
    inputBg: isDarkMode ? "#333" : "#f3f4f6",
    primary: "#ff6f00",
    success: isDarkMode ? "#4ade80" : "#16a34a",
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: "center",
      padding: 20,
    },
    modeToggle: { position: 'absolute', top: 40, right: 20, zIndex: 1 },
    card: {
      backgroundColor: theme.card,
      padding: 20,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 4,
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.primary,
      textAlign: "center",
      marginBottom: 20,
    },
    roleContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 20,
    },
    roleWrapper: { flexDirection: "row", alignItems: "center" },
    radio: {
      width: 20, height: 20, borderRadius: 10, borderWidth: 2,
      borderColor: theme.primary, justifyContent: "center", alignItems: "center", marginRight: 6,
    },
    radioActive: { backgroundColor: theme.primary },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" },
    roleText: { fontSize: 16, color: theme.text },
    input: {
      backgroundColor: theme.inputBg,
      color: theme.text,
      padding: 12, borderRadius: 8, marginVertical: 6, fontSize: 15,
    },
    approvalNote: {
      fontSize: 13, color: theme.primary, textAlign: 'center',
      marginTop: 10, fontStyle: 'italic',
    },
    buttons: { marginTop: 20 },
    button: {
      backgroundColor: theme.primary, padding: 14, borderRadius: 8,
      alignItems: "center", marginVertical: 5,
    },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    successBox: { alignItems: "center", padding: 20 },
    successText: { marginTop: 10, fontSize: 18, fontWeight: "bold", color: theme.success },
  });
};