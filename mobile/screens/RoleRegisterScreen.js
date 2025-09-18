import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { baseStyles } from "../styles/theme";

export default function RoleRegister({ route, navigation }) {
  const { role } = route.params;

  return (
    <View style={baseStyles.container}>
      <Text style={baseStyles.header}>Register as {role}</Text>

      <TextInput style={baseStyles.input} placeholder="Full Name" />
      <TextInput style={baseStyles.input} placeholder="Email" keyboardType="email-address" />
      <TextInput style={baseStyles.input} placeholder="Password" secureTextEntry />
      <TextInput style={baseStyles.input} placeholder="Confirm Password" secureTextEntry />

      <TouchableOpacity
        style={baseStyles.button}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={baseStyles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}
