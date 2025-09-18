import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { baseStyles } from "../styles/theme";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={baseStyles.container}>
      <Text style={baseStyles.header}>Welcome to Msika Wanjala</Text>
      <Text style={baseStyles.desc}>
        Your trusted marketplace for buying, selling, and connecting with your community.
      </Text>

      {/* Start Shopping → Role Selection */}
      <TouchableOpacity
        style={baseStyles.button}
        onPress={() => navigation.navigate("RoleSelection")}
      >
        <Text style={baseStyles.buttonText}>Start Shopping</Text>
      </TouchableOpacity>

      {/* Continue as Guest → HomeScreen */}
      <TouchableOpacity
        style={baseStyles.secondaryButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={baseStyles.secondaryButtonText}>Continue as Guest</Text>
      </TouchableOpacity>
    </View>
  );
}
