import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
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
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.secondaryButtonText}>Continue as Guest</Text>
      </TouchableOpacity>

      {/* Sign Up Link → now goes to SignUpScreen */}
      <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
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
    backgroundColor: "#fff",
  },
  icon: {
    marginBottom: 16,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#222",
  },
  desc: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#ff6f00",
    paddingVertical: 14,
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
    paddingVertical: 14,
    borderRadius: 10,
    width: "85%",
    alignItems: "center",
    marginBottom: 20,
  },
  secondaryButtonText: { color: "#ff6f00", fontSize: 18, fontWeight: "bold" },
  signupText: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },
});
