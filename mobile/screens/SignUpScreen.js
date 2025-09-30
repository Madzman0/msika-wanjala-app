import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

export default function SignupScreen({ navigation }) {
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRegister = () => {
    if (!role) {
      Alert.alert("Please select a role");
      return;
    }

    // Simple validation
    let missing = Object.values(formData).some((f) => !f);
    if (missing) {
      Alert.alert("Please fill all fields");
      return;
    }

    // Success animation
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      navigation.replace("Login"); // back to login after 2s
    }, 2000);
  };

  const handleCancel = () => {
    navigation.replace("Welcome");
  };

  // Fields per role
  const renderFields = () => {
    switch (role) {
      case "Seller":
        return (
          <>
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              onChangeText={(v) => handleChange("name", v)}
            />
            <TextInput
              placeholder="Business Name"
              style={styles.input}
              onChangeText={(v) => handleChange("business", v)}
            />
            <TextInput
              placeholder="Email"
              keyboardType="email-address"
              style={styles.input}
              onChangeText={(v) => handleChange("email", v)}
            />
            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              onChangeText={(v) => handleChange("password", v)}
            />
          </>
        );
      case "Buyer":
        return (
          <>
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              onChangeText={(v) => handleChange("name", v)}
            />
            <TextInput
              placeholder="Email"
              keyboardType="email-address"
              style={styles.input}
              onChangeText={(v) => handleChange("email", v)}
            />
            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              onChangeText={(v) => handleChange("password", v)}
            />
            <TextInput
              placeholder="Delivery Address"
              style={styles.input}
              onChangeText={(v) => handleChange("address", v)}
            />
          </>
        );
      case "Transporter":
        return (
          <>
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              onChangeText={(v) => handleChange("name", v)}
            />
            <TextInput
              placeholder="Vehicle Type"
              style={styles.input}
              onChangeText={(v) => handleChange("vehicle", v)}
            />
            <TextInput
              placeholder="License Number"
              style={styles.input}
              onChangeText={(v) => handleChange("license", v)}
            />
            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              onChangeText={(v) => handleChange("password", v)}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => {
            setRole(itemValue);
            setFormData({});
          }}
        >
          <Picker.Item label="Select Role" value="" />
          <Picker.Item label="Seller" value="Seller" />
          <Picker.Item label="Buyer" value="Buyer" />
          <Picker.Item label="Transporter" value="Transporter" />
        </Picker>
      </View>

      {renderFields()}

      {success ? (
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle" size={36} color="green" />
          <Text style={styles.successText}>
            Successfully registered as {role}
          </Text>
        </View>
      ) : (
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
            <Text style={styles.btnText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#1f2937",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  registerBtn: {
    flex: 1,
    marginRight: 8,
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtn: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  successBox: {
    marginTop: 20,
    alignItems: "center",
  },
  successText: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600",
    color: "green",
  },
});
