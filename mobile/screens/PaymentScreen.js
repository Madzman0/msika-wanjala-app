// screens/PaymentScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    address,
    method,
    total,
    items,
    discount = 0,
    deliveryOption,
  } = route.params || {};

  const [isProcessing, setIsProcessing] = useState(false);

  const getMethodName = (id) => {
    switch (id) {
      case "card":
        return { name: "Credit/Debit Card", icon: <FontAwesome5 name="credit-card" size={20} color="#ff6f00" /> };
      case "paypal":
        return { name: "PayPal", icon: <FontAwesome5 name="paypal" size={20} color="#003087" /> };
      case "cash":
        return { name: "Cash on Delivery", icon: <MaterialCommunityIcons name="cash" size={22} color="#2e7d32" /> };
      default:
        return { name: "Unknown", icon: <Ionicons name="help-circle-outline" size={20} color="#999" /> };
    }
  };

  const handlePayment = () => {
    if (!address || !method || !items || items.length === 0) {
      Alert.alert("Error", "Missing checkout information. Please go back and try again.");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      navigation.replace("Confirmation", {
        address,
        method,
        total,
        items,
        discount,
        deliveryOption,
      });
    }, 2000);
  };

  const paymentInfo = getMethodName(method);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ✅ Logo */}
      <View style={styles.logoWrapper}>
        <Image
          source={require("../assets/logo.png")} // make sure your logo exists in assets
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.header}>Confirm Your Payment</Text>

      {/* Delivery Address */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Address</Text>
        <Text style={styles.cardText}>{address || "N/A"}</Text>
      </View>

      {/* Delivery Option */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Option</Text>
        <Text style={styles.cardText}>{deliveryOption || "N/A"}</Text>
      </View>

      {/* Payment Method */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment Method</Text>
        <View style={styles.methodRow}>
          {paymentInfo.icon}
          <Text style={styles.cardText}>{paymentInfo.name}</Text>
        </View>
      </View>

      {/* Order Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Summary</Text>
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.name} x{item.qty || 1}</Text>
              <Text style={styles.itemPrice}>MWK {(item.price * (item.qty || 1)).toLocaleString()}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.cardText}>No items found.</Text>
        )}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>MWK {total?.toLocaleString() || 0}</Text>
        </View>

        {discount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount</Text>
            <Text style={[styles.totalValue, { color: "red" }]}>- MWK {discount.toLocaleString()}</Text>
          </View>
        )}

        <View style={[styles.totalRow, styles.payRow]}>
          <Text style={styles.payLabel}>Pay</Text>
          <Text style={styles.payValue}>MWK {Math.max(0, total - discount).toLocaleString()}</Text>
        </View>
      </View>

      {/* Confirm Button */}
      <TouchableOpacity
        style={[styles.payBtn, isProcessing && { backgroundColor: "#ccc" }]}
        onPress={handlePayment}
        disabled={isProcessing}
      >
        <Text style={styles.payText}>
          {isProcessing ? "Processing..." : "Confirm Payment"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 18,
    backgroundColor: "#f5f7fa",
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 15,
  },
  logo: {
    width: 120,
    height: 60,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ff6f00",
    textAlign: "center",
    marginBottom: 22,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  cardText: {
    fontSize: 16,
    color: "#555",
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 15,
    color: "#444",
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff6f00",
  },
  payRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 10,
    paddingTop: 8,
  },
  payLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  payValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff6f00",
  },
  payBtn: {
    backgroundColor: "#ff6f00",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  payText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});
