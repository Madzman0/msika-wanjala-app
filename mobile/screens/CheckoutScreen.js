// screens/CheckoutScreen.js

import React, { useContext, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CartContext } from "../context/CartContext";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const { cartItems, getTotalPrice } = useContext(CartContext);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null);

  const [deliveryType, setDeliveryType] = useState(null);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [typeModalVisible, setTypeModalVisible] = useState(false);

  const paymentMethods = [
    { id: "card", name: "Credit / Debit Card", icon: "card-outline" },
    { id: "paypal", name: "PayPal", icon: "logo-paypal" },
    { id: "cash", name: "Cash on Delivery", icon: "cash-outline" },
  ];

  const allVehicles = {
    Car: { icon: <FontAwesome5 name="car-side" size={24} color="#fff" />, color: "#1976d2" },
    Truck: { icon: <FontAwesome5 name="truck" size={24} color="#fff" />, color: "#e64a19" },
    Motorbike: { icon: <FontAwesome5 name="motorcycle" size={24} color="#fff" />, color: "#388e3c" },
    Bicycle: { icon: <FontAwesome5 name="bicycle" size={24} color="#fff" />, color: "#fbc02d" },
  };

  // Fee table based on type + vehicle
  const vehicleFees = {
    "Within district": { Car: 500, Truck: 800, Motorbike: 300, Bicycle: 100 },
    "Post district": { Car: 1000, Truck: 1500, Motorbike: 700, Bicycle: 300 },
  };

  const getVehiclesByType = (type) => {
    if (type === "Within district") return ["Car", "Motorbike", "Bicycle"];
    if (type === "Post district") return ["Truck", "Car", "Motorbike"];
    return [];
  };

  const total = useMemo(() => getTotalPrice(), [cartItems]);

  // Dynamic delivery fee
  const deliveryFee =
    deliveryType && selectedVehicle
      ? vehicleFees[deliveryType][selectedVehicle] || 0
      : 0;

  const totalWithDelivery = total + deliveryFee;

  const proceedToPayment = () => {
    if (!address || !phone || !postalCode) {
      Alert.alert("Incomplete Info", "Please fill in all required fields.");
      return;
    }
    if (!deliveryType || !selectedVehicle) {
      Alert.alert("Delivery Option", "Please select delivery type and vehicle.");
      return;
    }
    if (!selectedMethod) {
      Alert.alert("Payment Method", "Please select a payment method.");
      return;
    }

    navigation.navigate("Payment", {
      address,
      phone,
      postalCode,
      deliveryNotes,
      promoCode,
      deliveryOption: `${deliveryType} - ${selectedVehicle}`,
      method: selectedMethod,
      total: totalWithDelivery,
      items: cartItems,
      deliveryFee,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Checkout</Text>

      {/* Shipping Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Address"
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="Postal Code"
          value={postalCode}
          onChangeText={setPostalCode}
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Delivery Notes (optional)"
          value={deliveryNotes}
          onChangeText={setDeliveryNotes}
          multiline
        />

        {/* Delivery Type Button */}
        <TouchableOpacity
          style={styles.deliveryBtn}
          onPress={() => setTypeModalVisible(true)}
        >
          <Text style={styles.deliveryBtnText}>
            {deliveryType
              ? `Delivery: ${deliveryType} - ${selectedVehicle || "Select Vehicle"}`
              : "Choose Type of Transport"}
          </Text>
        </TouchableOpacity>

        {/* Dynamic Fee Note */}
        {selectedVehicle && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ color: "#555", fontSize: 14 }}>
              Note: An extra fee of MWK {deliveryFee.toLocaleString()} applies for {selectedVehicle} ({deliveryType}).
            </Text>
          </View>
        )}
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.methodCardSelected,
            ]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <Ionicons
              name={method.icon}
              size={22}
              color={selectedMethod === method.id ? "#fff" : "#ff6f00"}
              style={styles.methodIcon}
            />
            <Text
              style={[
                styles.methodText,
                selectedMethod === method.id && styles.methodTextSelected,
              ]}
            >
              {method.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Promo Code */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Promo Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Promo Code"
          value={promoCode}
          onChangeText={setPromoCode}
        />
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cartItems.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Image
              source={{ uri: item.image || "https://via.placeholder.com/60" }}
              style={styles.itemImage}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQty}>Qty: {item.qty || 1}</Text>
            </View>
            <Text style={styles.itemPrice}>
              MWK {(item.price * (item.qty || 1)).toLocaleString()}
            </Text>
          </View>
        ))}
        {deliveryFee > 0 && (
          <View style={[styles.totalRow, { marginTop: 4 }]}>
            <Text style={styles.totalText}>Delivery Fee</Text>
            <Text style={[styles.totalPrice, { fontSize: 16 }]}>
              MWK {deliveryFee.toLocaleString()}
            </Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={[styles.totalPrice, deliveryFee > 0 && { color: "#ff6f00" }]}>
            MWK {totalWithDelivery.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Proceed Button */}
      <TouchableOpacity style={styles.proceedBtn} onPress={proceedToPayment}>
        <Text style={styles.proceedText}>Proceed to Payment</Text>
      </TouchableOpacity>

      {/* Modal: Delivery Type */}
      <Modal
        transparent
        animationType="slide"
        visible={typeModalVisible}
        onRequestClose={() => setTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Delivery Type</Text>
            {["Within district", "Post district"].map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.modalOption}
                onPress={() => {
                  setDeliveryType(type);
                  setTypeModalVisible(false);
                  setSelectedVehicle(null); // Reset vehicle on type change
                  setVehicleModalVisible(true);
                }}
              >
                <Text style={styles.modalOptionText}>{type}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setTypeModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Vehicle Selection */}
      <Modal
        transparent
        animationType="slide"
        visible={vehicleModalVisible}
        onRequestClose={() => setVehicleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Vehicle</Text>
            {getVehiclesByType(deliveryType).map((vName) => {
              const v = allVehicles[vName];
              return (
                <TouchableOpacity
                  key={vName}
                  style={[styles.vehicleOption, { backgroundColor: v.color }]}
                  onPress={() => {
                    setSelectedVehicle(vName);
                    setVehicleModalVisible(false);
                  }}
                >
                  {v.icon}
                  <Text style={styles.modalOptionText}>{vName}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setVehicleModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 16 },
  header: { fontSize: 26, fontWeight: "bold", marginBottom: 16, color: "#ff6f00" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
    fontSize: 16,
    marginBottom: 12,
  },
  deliveryBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ff6f00",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  deliveryBtnText: { fontSize: 16, fontWeight: "500", color: "#ff6f00" },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ff6f00",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  methodCardSelected: { backgroundColor: "#ff6f00" },
  methodIcon: { marginRight: 12 },
  methodText: { fontSize: 16, color: "#333" },
  methodTextSelected: { color: "#fff", fontWeight: "bold" },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  itemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: "#eee" },
  itemName: { fontSize: 16, fontWeight: "500", color: "#555" },
  itemQty: { fontSize: 14, color: "#888", marginTop: 4 },
  itemPrice: { fontSize: 16, fontWeight: "bold", color: "#333" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  totalText: { fontSize: 18, fontWeight: "bold" },
  totalPrice: { fontSize: 18, fontWeight: "bold", color: "#ff6f00" },
  proceedBtn: {
    backgroundColor: "#ff6f00",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  proceedText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20, color: "#333" },
  modalOption: {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#ff6f00",
    marginBottom: 12,
    alignItems: "center",
  },
  vehicleOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    gap: 10,
  },
  modalOptionText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  modalCancel: { marginTop: 8 },
  modalCancelText: { color: "#888", fontSize: 16 },
});
