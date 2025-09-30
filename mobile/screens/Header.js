// Header.js
import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Header({ user, initials, navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.header}>
      {/* Logo + App Name */}
      <View style={styles.logoContainer}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
        <Text style={styles.appName}>Msika Wanjala</Text>
      </View>

      {/* Profile & Menu */}
      <View style={styles.headerActions}>
        <TouchableOpacity>
          <View style={styles.profileCircle}>
            {user.profilePic ? (
              <Image source={user.profilePic} style={styles.profilePic} />
            ) : (
              <Text style={styles.initialsText}>{initials}</Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Hamburger Menu Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.hamburgerMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("VendorProfile")}>
              <Text style={styles.menuItemText}>Switch to vendor profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("RateApp")}>
              <Text style={styles.menuItemText}>Rate this app</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Logout")}>
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  logo: { width: 40, height: 40, marginRight: 10 },
  appName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  headerActions: { flexDirection: "row", alignItems: "center" },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  initialsText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  hamburgerMenu: {
    marginTop: 50,
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    padding: 10,
  },
  menuItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  menuItemText: { fontSize: 16, color: "#333" },
});
