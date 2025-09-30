// VendorLoginScreen.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const VendorLoginScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Logo & App Name */}
      <View style={styles.header}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
        <Text style={styles.appName}>Msika Wanjala</Text>
        <Text style={styles.subtitle}>Choose your vendor role to continue</Text>
      </View>

      {/* Card with options */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("SellerLogin")}
        >
          <Ionicons name="storefront-outline" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Seller</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("DepotLogin")}
        >
          <MaterialIcons name="warehouse" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Depot</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("TransporterLogin")}
        >
          <FontAwesome5 name="truck" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Transporter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VendorLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdfdfd",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    marginBottom: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ff6f00",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff6f00",
    paddingVertical: 14,
    borderRadius: 10,
    marginVertical: 8,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
