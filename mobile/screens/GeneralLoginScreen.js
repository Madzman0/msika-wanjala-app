import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GeneralLoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity onPress={() => alert("Forgot password flow here")}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.replace("Home")}
      >
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>or</Text>

      {/* Google Login */}
      <TouchableOpacity style={styles.socialButton}>
        <Ionicons name="logo-google" size={20} color="#fff" />
        <Text style={styles.socialText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Facebook Login */}
      <TouchableOpacity style={[styles.socialButton, { backgroundColor: "#1877f2" }]}>
        <Ionicons name="logo-facebook" size={20} color="#fff" />
        <Text style={styles.socialText}>Continue with Facebook</Text>
      </TouchableOpacity>

      {/* Register Link */}
      <TouchableOpacity onPress={() => navigation.navigate("RoleRegister")}>
        <Text style={styles.registerText}>
          Don’t have an account? <Text style={{ color: "#ff6f00" }}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
  },
  inputContainer: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  icon: { marginRight: 8 },
  eyeIcon: { marginLeft: 8 },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  forgotText: {
    alignSelf: "flex-end",
    marginRight: "5%",
    marginTop: 4,
    marginBottom: 12,
    color: "#ff6f00",
    fontWeight: "600",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#ff6f00",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    marginVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  loginText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  orText: { marginVertical: 12, color: "#666", fontSize: 14 },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#db4437",
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    width: "90%",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
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
