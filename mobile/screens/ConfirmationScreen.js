// screens/ConfirmationScreen.js

import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
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

  // --- State for Tracking Modal ---
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState("pending"); // pending -> claimed -> in-transit
  const [progress, setProgress] = useState(0);
  const [transporter, setTransporter] = useState(null);
  const intervalRef = useRef(null);

  // ✅ Clear cart when screen loads
  useEffect(() => {
    setCartItems([]);
  }, []);

  const finalTotal = Math.max(0, total - discount);

  // --- Tracking Simulation Logic ---
  useEffect(() => {
    if (trackingModalVisible) {
      // Reset state on open
      setTrackingStatus("pending");
      setProgress(5); // Initial small progress
      setTransporter(null);

      // Simulate status changes
      const t1 = setTimeout(() => {
        setTrackingStatus("claimed");
        setProgress(25);
        setTransporter({ name: "Mike J.", vehicle: "Motorbike", rating: 4.8 });
      }, 2000);

      const t2 = setTimeout(() => {
        setTrackingStatus("in-transit");
        // Start progress bar simulation
        intervalRef.current = setInterval(() => {
          setProgress((p) => {
            if (p >= 95) {
              clearInterval(intervalRef.current);
              return 95;
            }
            return p + Math.floor(Math.random() * 10) + 5;
          });
        }, 1000);
      }, 4000);

      // Cleanup on modal close
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearInterval(intervalRef.current);
      };
    }
  }, [trackingModalVisible]);

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
          onPress={() => navigation.navigate("BuyerHomeScreen")}
        >
          <Text style={styles.doneText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.doneBtn, { backgroundColor: "#1976d2", marginTop: 12 }]}
          onPress={() => setTrackingModalVisible(true)}
        >
          <Text style={styles.doneText}>Track Order</Text>
        </TouchableOpacity>
      </View>

      {/* --- Tracking Modal --- */}
      <Modal
        transparent
        animationType="slide"
        visible={trackingModalVisible}
        onRequestClose={() => setTrackingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.trackingModal}>
            <Text style={styles.trackingTitle}>Order Tracking</Text>

            {/* Mock Map */}
            <View style={styles.mapContainer}>
              <View style={[styles.mapMarker, { top: "20%", left: "15%" }]}>
                <FontAwesome5 name="warehouse" size={20} color="#fff" />
                <Text style={styles.markerLabel}>Depot</Text>
              </View>
              <View style={[styles.mapMarker, { top: "65%", left: "75%" }]}>
                <Ionicons name="home" size={20} color="#fff" />
                <Text style={styles.markerLabel}>You</Text>
              </View>
            </View>

            {/* Status Timeline */}
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <View style={[styles.statusIcon, trackingStatus !== 'pending' && styles.statusIconActive]}>
                  <Ionicons name="receipt-outline" size={20} color={trackingStatus !== 'pending' ? "#fff" : "#888"} />
                </View>
                <Text style={styles.statusLabel}>Pending</Text>
              </View>
              <View style={styles.statusLine} />
              <View style={styles.statusItem}>
                <View style={[styles.statusIcon, trackingStatus === 'in-transit' && styles.statusIconActive]}>
                  <Ionicons name="person-outline" size={20} color={trackingStatus === 'in-transit' ? "#fff" : "#888"} />
                </View>
                <Text style={styles.statusLabel}>Claimed</Text>
              </View>
              <View style={styles.statusLine} />
              <View style={styles.statusItem}>
                <View style={styles.statusIcon}>
                  <Ionicons name="bicycle-outline" size={20} color="#888" />
                </View>
                <Text style={styles.statusLabel}>In Transit</Text>
              </View>
            </View>

            {/* Transporter Info */}
            {transporter && (
              <View style={styles.transporterBox}>
                <Image source={{ uri: `https://i.pravatar.cc/100?u=${transporter.name}` }} style={styles.transporterAvatar} />
                <View>
                  <Text style={styles.transporterName}>{transporter.name}</Text>
                  <Text style={styles.transporterVehicle}>{transporter.vehicle}</Text>
                </View>
                <View style={styles.ratingBox}>
                  <Ionicons name="star" size={16} color="#ffc107" />
                  <Text style={styles.ratingText}>{transporter.rating}</Text>
                </View>
              </View>
            )}

            {/* Progress Bar */}
            <View style={{ marginTop: 16 }}>
              <Text style={styles.progressLabel}>
                {trackingStatus === 'in-transit' ? 'Delivery in Progress...' : 'Waiting for transporter...'}
              </Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFg, { width: `${progress}%` }]} />
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setTrackingModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 18,
    backgroundColor: "#121212",
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
    color: "#b0b0b0",
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
    backgroundColor: "#1e1e1e",
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
    color: "#fff",
  },
  cardText: {
    fontSize: 16,
    color: "#f0f0f0",
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
    color: "#f0f0f0",
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#b0b0b0",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff6f00",
  },
  payRow: {
    borderTopWidth: 1,
    borderTopColor: "#272727",
    marginTop: 10,
    paddingTop: 8,
  },
  payLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
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
  // --- Tracking Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  trackingModal: {
    width: "90%",
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  trackingTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  mapContainer: {
    height: 150,
    backgroundColor: "#e0f7fa",
    borderRadius: 15,
    position: "relative",
    overflow: "hidden",
    marginBottom: 20,
  },
  mapMarker: {
    position: "absolute",
    backgroundColor: "#ff6f00",
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  markerLabel: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 10,
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statusItem: {
    alignItems: "center",
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  statusIconActive: {
    backgroundColor: "#2e7d32",
  },
  statusLabel: {
    fontSize: 12,
    color: "#b0b0b0",
    marginTop: 4,
    fontWeight: "600",
  },
  statusLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#333",
    marginHorizontal: -10,
  },
  transporterBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 12,
  },
  transporterAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  transporterName: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  transporterVehicle: { fontSize: 14, color: "#b0b0b0" },
  ratingBox: { flexDirection: "row", alignItems: "center", marginLeft: "auto", backgroundColor: "#1e1e1e", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  ratingText: { marginLeft: 4, fontWeight: "bold", color: "#fff" },
  progressLabel: {
    fontSize: 14,
    color: "#b0b0b0",
    marginBottom: 8,
    fontWeight: "500",
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "#333",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFg: {
    height: "100%",
    backgroundColor: "#ff6f00",
    borderRadius: 5,
  },
  closeModalBtn: {
    marginTop: 24,
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeModalText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
