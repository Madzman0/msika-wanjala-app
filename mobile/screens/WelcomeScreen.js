import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen({ navigation }) {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      {/* Responsive container for the main content */}
      <View style={[styles.contentContainer, width > 768 && styles.desktopContentContainer]}>
        <Ionicons name="storefront-outline" size={64} color="#ff6f00" style={styles.icon} />

        <Text style={styles.header}>Welcome to Msika Wanjala</Text>
        <Text style={styles.desc}>
          Your trusted marketplace for buying, selling, and connecting with your community.
        </Text>

        {/* Login button → goes to General Login */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("GeneralLogin")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* Continue as Guest → goes to Home */}
        <TouchableOpacity
          style={styles.secondaryButton}
        onPress={() => navigation.navigate("BuyerHomeScreen")}
        >
          <Text style={styles.secondaryButtonText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Link → now goes to SignUpScreen */}
      <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
        <Text style={styles.signupText}>
          Don’t have an account? <Text style={{ color: "#ff6f00" }}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#121212",
  },
  // New responsive container
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  desktopContentContainer: {
    maxWidth: 500,
    alignSelf: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#fff",
  },
  desc: {
    fontSize: 16,
    color: "#b0b0b0",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#ff6f00",
    paddingVertical: 16,
    borderRadius: 10,
    width: "85%",
    alignItems: "center",
    marginBottom: 15,
    elevation: 3,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  secondaryButton: {
    borderColor: "#ff6f00",
    borderWidth: 2,
    paddingVertical: 16,
    borderRadius: 10,
    width: "85%",
    alignItems: "center",
    marginBottom: 20,
  },
  secondaryButtonText: { color: "#ff6f00", fontSize: 18, fontWeight: "bold" },
  signupText: {
    fontSize: 14,
    color: "#b0b0b0",
    marginTop: 10,
  },
});
