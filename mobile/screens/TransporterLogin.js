// TransporterLoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TransporterLogin({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email && password) {
      navigation.replace("TransporterHome"); // create TransporterHomeScreen later
    } else {
      alert("Please enter email and password");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        {/* Logo */}
        <Image source={require("../assets/logo.png")} style={styles.logo} />

        {/* App Name */}
        <Text style={styles.appName}>Msika Wanjala</Text>

        {/* Screen Title */}
        <Text style={styles.title}>Transporter Login</Text>

        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password Input */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Forgot Password Link */}
        <TouchableOpacity
          onPress={() => alert("Forgot password flow here")}
          style={{ alignSelf: "flex-end", marginRight: "5%" }}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>──────  or  ──────</Text>

        {/* Google Login */}
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-google" size={22} color="#fff" />
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Facebook Login */}
        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: "#1877f2" }]}
        >
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#fff",
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
    resizeMode: "contain",
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff6f00",
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  input: {
    width: "90%",
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  forgotText: {
    marginTop: 6,
    marginBottom: 12,
    color: "#ff6f00",
    fontWeight: "600",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#32cd32", // Green for transporter role
    padding: 16,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    marginVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  loginText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  orText: {
    marginVertical: 12,
    color: "#888",
    fontSize: 14,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#db4437",
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
    width: "90%",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  socialText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 15,
  },
  registerText: {
    fontSize: 14,
    color: "#666",
  },
});
