// GeneralLoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GeneralLoginScreen({ navigation, setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email && password) {
      setIsLoggedIn(true);
      navigation.replace("BuyerHome");
    } else {
      alert("Please enter email and password");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Branding */}
      <View style={styles.header}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
        <Text style={styles.appName}>Msika Wanjala</Text>
        <Text style={styles.subtitle}>Welcome back! Please login to continue</Text>
      </View>

      {/* Login Card */}
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
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

        <TouchableOpacity onPress={() => alert("Forgot password flow here")}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.orText}>or continue with</Text>

      {/* Social Buttons */}
      <TouchableOpacity style={[styles.socialButton, { backgroundColor: "#db4437" }]}>
        <Ionicons name="logo-google" size={20} color="#fff" />
        <Text style={styles.socialText}>Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.socialButton, { backgroundColor: "#1877f2" }]}>
        <Ionicons name="logo-facebook" size={20} color="#fff" />
        <Text style={styles.socialText}>Facebook</Text>
      </TouchableOpacity>

      {/* Links */}
      <TouchableOpacity onPress={() => navigation.navigate("RoleRegister")}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdfdfd", padding: 20, justifyContent: "center" },

  header: { alignItems: "center", marginBottom: 20 },
  logo: { width: 90, height: 90, resizeMode: "contain", marginBottom: 8 },
  appName: { fontSize: 22, fontWeight: "bold", color: "#ff6f00" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4, textAlign: "center" },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 16,
  },

  input: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 15,
    color: "#333",
  },

  forgotText: {
    alignSelf: "flex-end",
    color: "#ff6f00",
    fontWeight: "600",
    fontSize: 14,
    marginVertical: 6,
  },

  loginButton: {
    backgroundColor: "#ff6f00",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  loginText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  orText: { textAlign: "center", color: "#666", marginVertical: 10, fontSize: 14 },

  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    justifyContent: "center",
    width: "100%",
  },
  socialText: { color: "#fff", fontWeight: "bold", marginLeft: 8, fontSize: 15 },

  registerText: { marginTop: 20, fontSize: 14, color: "#666", textAlign: "center" },
  vendorLoginText: { marginTop: 12, fontSize: 14, color: "#333", textAlign: "center" },
});
