import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  desc: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 30 },
  button: {
    backgroundColor: "#ff6f00",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  secondaryButton: {
    borderColor: "#ff6f00",
    borderWidth: 2,
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  secondaryButtonText: { color: "#ff6f00", fontSize: 18, fontWeight: "bold" },
});
