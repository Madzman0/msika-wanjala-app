// screens/RoleSelectionScreen.js
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const roles = [
  { id: "buyer", label: "Buyer", icon: "cart", note: "Browse & buy products" },
  { id: "seller", label: "Seller", icon: "storefront", note: "List items & manage orders" },
  { id: "depot", label: "Depot", icon: "business", note: "Warehouse / depot partner" },
  { id: "driver", label: "Driver", icon: "car", note: "Transport & deliveries" },
];

export default function RoleSelectionScreen({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? darkStyles : lightStyles;

  return (
    <ScrollView style={theme.container} contentContainerStyle={{ padding: 20 }}>
      <View style={theme.headerRow}>
        <Image source={require("../assets/logo.png")} style={theme.logo} />
        <Text style={theme.headerTitle}>Who are you?</Text>
      </View>

      <Text style={theme.lead}>Choose the account type to continue — each role has its own login & registration.</Text>

      <View style={theme.grid}>
        {roles.map((r) => (
          <View key={r.id} style={theme.card}>
            <View style={theme.cardTop}>
              <Ionicons name={r.icon} size={32} color="#ff6f00" />
              <Text style={theme.cardTitle}>{r.label}</Text>
            </View>
            <Text style={theme.cardNote}>{r.note}</Text>

            <View style={theme.cardActions}>
              <TouchableOpacity
                style={theme.btnOutline}
                onPress={() => navigation.navigate("RoleLogin", { role: r.id, label: r.label })}
              >
                <Text style={theme.btnOutlineText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={theme.btnSolid}
                onPress={() => navigation.navigate("RoleRegister", { role: r.id, label: r.label })}
              >
                <Text style={theme.btnSolidText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 18, alignItems: "center" }}>
        <Text style={theme.smallInfo}>Don’t have an account? Tap Register for your role.</Text>
      </View>
    </ScrollView>
  );
}

const lightStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  logo: { width: 48, height: 48, marginRight: 12 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#ff6f00" },
  lead: { color: "#555", marginBottom: 16 },
  grid: { },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12, elevation: 3, shadowColor: "#00000010" },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontSize: 18, marginLeft: 10, fontWeight: "700" },
  cardNote: { color: "#666", marginBottom: 12 },
  cardActions: { flexDirection: "row", justifyContent: "space-between" },
  btnOutline: { flex: 1, borderWidth: 1, borderColor: "#ff6f00", marginRight: 8, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  btnOutlineText: { color: "#ff6f00", fontWeight: "700" },
  btnSolid: { flex: 1, backgroundColor: "#ff6f00", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  btnSolidText: { color: "#fff", fontWeight: "700" },
  smallInfo: { color: "#777" },
});

const darkStyles = StyleSheet.create({
  ...lightStyles,
  container: { backgroundColor: "#0b1116" },
  card: { backgroundColor: "#0f1720", shadowColor: "#00000088" },
  cardNote: { color: "#bbb" },
  btnOutlineText: { color: "#ffcc80" },
  btnSolid: { backgroundColor: "#ff6f00" },
  smallInfo: { color: "#aaa" },
});
