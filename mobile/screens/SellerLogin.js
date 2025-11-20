// SellerLoginScreen.js
import React, { useState, useContext } from "react";
import { 
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

export default function SellerLoginScreen({ navigation, setIsLoggedIn }) {
  const [sellerId, setSellerId] = useState("");
  const [businessCertificate, setBusinessCertificate] = useState("");
  const [location, setLocation] = useState("");
  const { width } = useWindowDimensions();
  const { isDarkMode } = useContext(ThemeContext);

  const handleLogin = () => {
    // In a real app, you'd validate these against a backend.
    if (sellerId && businessCertificate && location) {
      setIsLoggedIn && setIsLoggedIn(true); // optional if you pass setIsLoggedIn
      navigation.replace("SellerHome"); // redirect to SellerHomeScreen
    } else {
      alert("Please fill in all professional qualifications.");
    }
  };

  const styles = getStyles(isDarkMode);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* The main container for the form content */}
      <View style={styles.container}>
        {/* Logo */}
        <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />

        {/* App Name */}
        <Text style={styles.appName}>Msika Wanjala</Text>

        {/* Screen Title */}
        <Text style={styles.title}>Seller Login</Text>
        
        {/* Responsive container for the form inputs and buttons */}
        <View style={[styles.formContainer, width > 768 && styles.desktopFormContainer]}>
          {/* Seller ID Input */}
          <TextInput
            style={styles.input}
            placeholder="Seller ID"
            placeholderTextColor={styles.placeholder.color}
            value={sellerId}
            onChangeText={setSellerId}
          />

          {/* Business Certificate Input */}
          <TextInput
            style={styles.input}
            placeholder="Business Certificate Number"
            placeholderTextColor={styles.placeholder.color}
            value={businessCertificate}
            onChangeText={setBusinessCertificate}
          />

          {/* Location Input */}
          <TextInput
            style={styles.input}
            placeholder="Your Location (e.g., Lilongwe)"
            placeholderTextColor={styles.placeholder.color}
            value={location}
            onChangeText={setLocation}
          />

          {/* Forgot Password Link */}

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>──────  or  ──────</Text>

          {/* Google Login */}
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#333' }]}>
            <Ionicons name="logo-google" size={22} color="#fff" />
            <Text style={styles.socialText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Facebook Login */}
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#333' }]}>
            <Ionicons name="logo-facebook" size={22} color="#fff" />
            <Text style={styles.socialText}>Continue with Facebook</Text>
          </TouchableOpacity>

          {/* Back to General Login */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: 20 }}
          >
            <Text style={styles.registerText}>
              Back to <Text style={{ color: "#ff6f00", fontWeight: "bold" }}>General Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const getStyles = (isDarkMode) => {
  const theme = {
    background: isDarkMode ? "#121212" : "#f9fafb",
    card: isDarkMode ? "#1e1e1e" : "#ffffff",
    text: isDarkMode ? "#f0f0f0" : "#1f2937",
    textSecondary: isDarkMode ? "#b0b0b0" : "#6b7280",
    inputBg: isDarkMode ? "#333" : "#f3f4f6",
    placeholder: isDarkMode ? "#999" : "#6b7280",
    primary: "#ff6f00",
  };

  return StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      backgroundColor: theme.background,
      justifyContent: "center",
    },
    container: {
      flex: 1,
      alignItems: "center",
      padding: 20,
    },
    logo: {
      width: 100,
      height: 100,
      marginBottom: 10,
      tintColor: isDarkMode ? theme.primary : undefined,
    },
    appName: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.primary,
      marginBottom: 4,
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 20,
    },
    formContainer: {
      width: '100%',
    },
    desktopFormContainer: {
      maxWidth: 500,
      alignSelf: 'center',
    },
    input: {
      width: "100%",
      backgroundColor: theme.inputBg,
      padding: 14,
      borderRadius: 10,
      marginVertical: 8,
      fontSize: 16,
      color: theme.text,
    },
    placeholder: {
      color: theme.placeholder,
    },
    loginButton: {
      backgroundColor: theme.primary,
      padding: 16,
      borderRadius: 10,
      width: "100%",
      alignItems: "center",
      marginVertical: 12,
      elevation: 3,
    },
    loginText: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "bold",
    },
    orText: {
      marginVertical: 12,
      color: theme.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    socialButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.inputBg,
      padding: 16,
      borderRadius: 10,
      marginVertical: 6,
      width: "100%",
      justifyContent: "center",
      elevation: 2,
    },
    socialText: {
      color: theme.text,
      fontWeight: "600",
      marginLeft: 8,
      fontSize: 15,
    },
    registerText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });
};
