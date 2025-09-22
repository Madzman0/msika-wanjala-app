// GeneralLoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GeneralLoginScreen({ navigation, setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // 🔑 fake login for now
    if (email && password) {
      setIsLoggedIn(true); // ✅ mark logged in
      navigation.replace("BuyerHome"); // ✅ redirect to BuyerHome
    } else {
      alert("Please enter email and password");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Forgot Password Link */}
      <TouchableOpacity onPress={() => alert("Forgot password flow here")}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>or</Text>

      {/* Google Login */}
      <TouchableOpacity style={styles.socialButton}>
        <Ionicons name="logo-google" size={20} color="#fff" />
        <Text style={styles.socialText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Facebook Login */}
      <TouchableOpacity
        style={[styles.socialButton, { backgroundColor: "#1877f2" }]}
      >
        <Ionicons name="logo-facebook" size={20} color="#fff" />
        <Text style={styles.socialText}>Continue with Facebook</Text>
      </TouchableOpacity>

      {/* Register Link */}
      <TouchableOpacity onPress={() => navigation.navigate("RoleRegister")}>
        <Text style={styles.registerText}>
          Don’t have an account?{" "}
          <Text style={{ color: "#ff6f00" }}>Sign up</Text>
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
    padding: 20,
    backgroundColor: "#fff",
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 8, color: "#222" },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 20 },
  input: {
    width: "90%",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 16,
    color: "#333",
  },
  forgotText: {
    alignSelf: "flex-end",
    marginRight: "6%",
    marginTop: 4,
    marginBottom: 12,
    color: "#ff6f00",
    fontWeight: "600",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#ff6f00",
    padding: 14,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
    marginVertical: 12,
  },
  loginText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  orText: { marginVertical: 10, color: "#666", fontSize: 14 },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#db4437", // Google Red
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    width: "90%",
    justifyContent: "center",
  },
  socialText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 15,
  },
  registerText: {
    marginTop: 20,
    fontSize: 14,
    color: "#666",
  },
});
