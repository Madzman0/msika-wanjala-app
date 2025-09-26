// screens/ConfirmationScreen.js

import React, { useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { CartContext } from "../context/CartContext";

export default function ConfirmationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    address,
    method,
    total = 0,
    items = [],
    discount = 0,
    deliveryOption,
  } = route.params || {};

  const { setCartItems } = useContext(CartContext);

  // ✅ Clear cart when screen loads
  useEffect(() => {
    setCartItems([]);
  }, []);

  const finalTotal = Math.max(0, total - discount);

  const getMethodInfo = (id) => {
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

  const paymentInfo = getMethodInfo(method);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ✅ Logo */}
      <View style={styles.logoWrapper}>
        <Image
          source={require("../assets/logo.png")} // place your app logo here
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* ✅ Success Box */}
      <View style={styles.successBox}>
        <Ionicons name="checkmark-circle" size={90} color="#2e7d32" />
        <Text style={styles.successText}>Payment Successful!</Text>
        <Text style={styles.successSub}>Thank you for your order 🎉</Text>
      </View>

      {/* ✅ Notification Panel */}
{deliveryOption && (
  <View style={styles.notificationBox}>
    <Ionicons name="notifications-outline" size={24} color="#1976d2" style={{ marginRight: 10 }} />
    <Text style={styles.notificationText}>
      Drivers for <Text style={{ fontWeight: "bold" }}>{deliveryOption}</Text> have been notified. Please wait for a confirmation notification in your <Text style={{ fontWeight: "bold" }}>Notifications tab</Text> and track your order once accepted.
    </Text>
  </View>
)}

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
        {items.length > 0 ? (
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
          <Text style={styles.totalValue}>MWK {total.toLocaleString()}</Text>
        </View>

        {discount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount</Text>
            <Text style={[styles.totalValue, { color: "red" }]}>
              - MWK {discount.toLocaleString()}
            </Text>
          </View>
        )}

        <View style={[styles.totalRow, styles.payRow]}>
          <Text style={styles.payLabel}>Total Paid</Text>
          <Text style={styles.payValue}>MWK {finalTotal.toLocaleString()}</Text>
        </View>
      </View>

      {/* ✅ Buttons Row */}
      <View style={{ marginTop: 16 }}>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate("BuyerHome")}
        >
          <Text style={styles.doneText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.doneBtn, { backgroundColor: "#1976d2", marginTop: 12 }]}
          onPress={() => navigation.navigate("TrackOrder", { orderItems: items })}
        >
          <Text style={styles.doneText}>Track Order</Text>
        </TouchableOpacity>
      </View>
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
  successBox: {
    alignItems: "center",
    marginVertical: 20,
  },
  successText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
    marginTop: 12,
  },
  successSub: {
    fontSize: 16,
    color: "#555",
    marginTop: 6,
  },
  notificationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  notificationText: {
    fontSize: 15,
    color: "#1976d2",
    flex: 1,
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
  doneBtn: {
    backgroundColor: "#ff6f00",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  doneText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});
