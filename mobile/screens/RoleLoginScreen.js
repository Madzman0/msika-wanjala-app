import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { baseStyles } from "../styles/theme";

export default function RoleLogin({ route, navigation }) {
  const { role } = route.params;

  return (
    <View style={baseStyles.container}>
      <Text style={baseStyles.header}>{role} Login</Text>

      <TextInput style={baseStyles.input} placeholder="Email" keyboardType="email-address" />
      <TextInput style={baseStyles.input} placeholder="Password" secureTextEntry />

      <TouchableOpacity
        style={baseStyles.button}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={baseStyles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={baseStyles.secondaryButton}
        onPress={() => navigation.navigate("RoleRegister", { role })}
      >
        <Text style={baseStyles.secondaryButtonText}>Register as {role}</Text>
      </TouchableOpacity>
    </View>
  );
}
