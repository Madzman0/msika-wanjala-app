import React, { useContext, useState, useMemo, useEffect } from "react";

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
  Switch,
  useWindowDimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { CartContext } from "../context/CartContext";
import { ThemeContext } from "../context/ThemeContext";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebaseConfig";
export default function CheckoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartItems, getTotalPrice } = useContext(CartContext);
  const { theme } = useContext(ThemeContext);
  const { width } = useWindowDimensions();
  const isWideScreen = width >= 768;
  const styles = getStyles(theme, isWideScreen);

  // State for user inputs
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [saveAddress, setSaveAddress] = useState(false);

  // State for modals and dynamic data
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [distance, setDistance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const paymentMethods = [
    { id: "airtel", name: "Airtel Money", icon: "phone-portrait-outline" },
    { id: "mpamba", name: "TNM Mpamba", icon: "phone-portrait-outline" },
    { id: "paychangu", name: "Pay Changu", icon: "wallet-outline" },
  ];

  // --- Simulation Data ---
  const DEPOT_LOCATION = { name: "Depot (Blantyre)", latitude: -15.7861, longitude: 35.0058 };
  const SAMPLE_LOCATIONS = [
    { name: "Lilongwe City Center", latitude: -13.9626, longitude: 33.7741 },
    { name: "Mzuzu, Katoto", latitude: -11.4484, longitude: 34.0188 },
    { name: "Zomba, Old Town", latitude: -15.3879, longitude: 35.3239 },
    { name: "Mangochi, Town", latitude: -14.4784, longitude: 35.2696 },
  ];

  const allVehicles = {
    Car: { icon: <FontAwesome5 name="car-side" size={24} color="#fff" />, color: "#1976d2" },
    Truck: { icon: <FontAwesome5 name="truck" size={24} color="#fff" />, color: "#e64a19" },
    Motorbike: { icon: <FontAwesome5 name="motorcycle" size={24} color="#fff" />, color: "#388e3c" },
    
  };

  // New rate-based fee calculation
  const ratesPerKm = {
    Motorbike: 1000,
    Car: 500,
    Truck: 300,
  };

  // Haversine formula to calculate distance between two lat/lng points
  const calculateDistance = (loc1, loc2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (loc2.latitude - loc1.latitude) * (Math.PI / 180);
    const dLon = (loc2.longitude - loc1.longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(loc1.latitude * (Math.PI / 180)) *
        Math.cos(loc2.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Listen for selected location from MapAddressScreen
  useEffect(() => {
    if (route.params?.selectedLocation) {
      const location = route.params.selectedLocation;
      setSelectedLocation(location);
      // Recalculate distance when a new location is selected
      setDistance(calculateDistance(DEPOT_LOCATION, location));
    }
  }, [route.params?.selectedLocation]);

  // Fetch saved addresses from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser(userData);
          setSavedAddresses(userData.savedAddresses || []);
        }
      }
    };
    fetchUserData();
  }, []);

  const total = useMemo(() => getTotalPrice(), [cartItems]);

  // Dynamic delivery fee
  const deliveryFee =
    selectedLocation && selectedVehicle && distance > 0
      ? Math.round(distance * ratesPerKm[selectedVehicle])
      : 0;

  const totalWithDelivery = total + deliveryFee;

  const proceedToPayment = async () => {
    if (!selectedLocation || !phone || !postalCode) {
      Alert.alert("Incomplete Info", "Please fill in all required fields.");
      return;
    }
    if (!selectedVehicle) {
      Alert.alert("Delivery Option", "Please select a delivery vehicle.");
      return;
    }
    if (!selectedMethod) {
      Alert.alert("Payment Method", "Please select a payment method.");
      return;
    }

    setIsProcessing(true);
    // Save address if toggled
    if (saveAddress && selectedLocation) {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          await updateDoc(userDocRef, {
            savedAddresses: arrayUnion(selectedLocation) // arrayUnion prevents duplicates
          });
        } catch (error) {
          console.error("Failed to save address:", error);
          // Don't block payment if saving address fails, just log it.
        }
      }
    }

    const paymentParams = {
      address: selectedLocation.name,
      buyerName: currentUser?.name || 'Guest Buyer',
      phone,
      postalCode,
      deliveryNotes,
      deliveryOption: `${selectedVehicle} (${distance.toFixed(1)
      } km)`,
      method: selectedMethod,
      total: totalWithDelivery,
      items: cartItems,
      deliveryFee,
    };

    // All methods now go to the unified PaymentScreen
    navigation.navigate("PaymentScreen", paymentParams);
    setIsProcessing(false);
  };

  const OrderSummaryContent = () => (
    <View style={styles.summaryContainer}>
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
      <TouchableOpacity style={styles.proceedBtn} onPress={proceedToPayment} disabled={isProcessing}>
        {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.proceedText}>Proceed to Payment</Text>}
      </TouchableOpacity>
    </View>
  );

  const CheckoutFormContent = () => (
    <View style={styles.formContainer}>
      {/* Shipping Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        <TouchableOpacity
          style={styles.addressBtn}
          onPress={() => setMapModalVisible(true)}
        >
          <Text style={styles.addressBtnText}>
            {selectedLocation ? selectedLocation.name : "Select Delivery Address"}
          </Text>
        </TouchableOpacity>
        <View style={styles.saveAddressRow}>
          <Text style={styles.saveAddressText}>Save this address for later</Text>
          <Switch
            value={saveAddress}
            onValueChange={setSaveAddress}
            trackColor={{ false: "#767577", true: theme.primaryLight }}
            thumbColor={saveAddress ? theme.primary : "#f4f3f4"}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          placeholderTextColor={theme.textSecondary}
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="Postal Code"
          value={postalCode}
          placeholderTextColor={theme.textSecondary}
          onChangeText={setPostalCode}
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Delivery Notes (optional)"
          value={deliveryNotes}
          placeholderTextColor={theme.textSecondary}
          onChangeText={setDeliveryNotes}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.deliveryBtn,
            selectedVehicle && { backgroundColor: allVehicles[selectedVehicle]?.color || theme.primary }
          ]}
          onPress={() => setVehicleModalVisible(true)}
        >
          <FontAwesome5
            name={
              selectedVehicle === 'Car' ? 'car-side' :
              selectedVehicle === 'Truck' ? 'truck' :
              selectedVehicle === 'Motorbike' ? 'motorcycle' :
              'truck-pickup' // A generic default icon
            }
            size={20}
            color={selectedVehicle ? '#fff' : theme.primary}
          />
          <Text style={[styles.deliveryBtnText, selectedVehicle && { color: '#fff' }]}>
            {selectedVehicle ? `Vehicle: ${selectedVehicle}` : "Choose Vehicle"}
          </Text>
        </TouchableOpacity>
        {selectedVehicle && selectedLocation && (
          <View style={{ marginTop: 8, paddingHorizontal: 4 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 20 }}>
              Note: A delivery fee of MWK {deliveryFee.toLocaleString()} applies for a {distance.toFixed(1)} km trip via {selectedVehicle}.
            </Text>
          </View>
        )}
      </View>

      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Addresses</Text>
          {savedAddresses.map((addr, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.addressBtn,
                selectedLocation?.name === addr.name && styles.selectedAddressCard
              ]}
              onPress={() => {
                setSelectedLocation(addr);
                setDistance(calculateDistance(DEPOT_LOCATION, addr));
              }}
            >
              <Text style={styles.addressBtnText}>{addr.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
              color={selectedMethod === method.id ? "#fff" : theme.primary}
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
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Checkout</Text>
      {isWideScreen ? (
        // Wide screen: Two-column layout with a scrollable form
        <View style={styles.mainContent}>
          <ScrollView style={styles.formScrollView}>
            <CheckoutFormContent />
          </ScrollView>
          <OrderSummaryContent />
        </View>
      ) : (
        // Mobile: Single scrollable page
        <ScrollView>
          <CheckoutFormContent />
          <OrderSummaryContent />
        </ScrollView>
      )}

      {/* --- Mock Map Modal --- */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.mapModalBox}>
          <Text style={styles.modalTitle}>Select a Location (Placeholder)</Text>
          <View style={styles.mapContainer}>
            {/* Depot Marker */}
            <View style={[styles.mapMarker, styles.depotMarker, { top: '45%', left: '45%' }]}>
              <Ionicons name="business" size={20} color="#fff" />
            </View>
            {/* Sample Location Markers */}
            {SAMPLE_LOCATIONS.map((loc, index) => (
              <TouchableOpacity
                key={loc.name}
                style={[styles.mapMarker, styles.locationMarker, getMarkerPosition(index)]}
                onPress={() => {
                  setSelectedLocation(loc);
                  setDistance(calculateDistance(DEPOT_LOCATION, loc));
                  setMapModalVisible(false);
                }}
              >
                <Ionicons name="location-sharp" size={20} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.modalCancel} onPress={() => setMapModalVisible(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="slide"
        visible={vehicleModalVisible}
        onRequestClose={() => setVehicleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Vehicle</Text>
            {Object.keys(allVehicles).map((vName) => {
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
    </View>
  );
}

// Helper to position markers on the mock map
const getMarkerPosition = (index) => {
  const positions = [
    { top: '15%', left: '20%' },
    { top: '70%', left: '80%' },
    { top: '25%', left: '75%' },
    { top: '80%', left: '10%' },
  ];
  return positions[index % positions.length];
};

const getStyles = (theme, isWideScreen) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: isWideScreen ? 24 : 16,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
    color: theme.primary,
    paddingHorizontal: isWideScreen ? 0 : 16,
  },
  mainContent: {
    flex: 1,
    flexDirection: isWideScreen ? 'row' : 'column',
  },
  formScrollView: { // Used for the form in wide-screen mode
    flex: 2,
    paddingRight: 16,
  },
  formContainer: {
    flex: isWideScreen ? 1 : 'auto',
  },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12, color: theme.text },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 14,
    backgroundColor: theme.input,
    fontSize: 16,
    marginBottom: 12,
    color: theme.text,
  },
  addressBtn: {
    borderWidth: 1,
    borderColor: theme.primary,
    borderRadius: 12,
    padding: 14,
    backgroundColor: theme.card,
    marginBottom: 12,
  },
  selectedAddressCard: {
    borderColor: theme.primary,
    borderWidth: 2,
    backgroundColor: theme.primaryLight,
  },
  saveAddressRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12, paddingHorizontal: 4,
  },
  saveAddressText: { color: theme.text, fontSize: 15 },
  addressBtnText: { fontSize: 16, color: theme.text },
  deliveryBtn: {
    backgroundColor: theme.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.primary,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    gap: 10,
  },
  deliveryBtnText: { fontSize: 16, fontWeight: "500", color: theme.primary },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: theme.primary,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: theme.card,
  },
  methodCardSelected: { backgroundColor: theme.primary },
  methodIcon: { marginRight: 12 },
  methodText: { fontSize: 16, color: theme.text },
  methodTextSelected: { color: "#fff", fontWeight: "bold" },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  itemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: "#eee" },
  itemName: { fontSize: 16, fontWeight: "500", color: theme.text },
  itemQty: { fontSize: 14, color: theme.textSecondary, marginTop: 4 },
  itemPrice: { fontSize: 16, fontWeight: "bold", color: theme.text },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 8 },
  totalText: { fontSize: 16, fontWeight: "600", color: theme.text },
  totalPrice: { fontSize: 16, fontWeight: "bold", color: theme.primary },
  summaryContainer: {
    flex: isWideScreen ? 1 : 'auto',
    backgroundColor: isWideScreen ? theme.card : 'transparent',
    padding: isWideScreen ? 16 : 0,
    borderRadius: isWideScreen ? 12 : 0,
    marginTop: isWideScreen ? 0 : 16,
  },
  proceedBtn: {
    backgroundColor: theme.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: isWideScreen ? 0 : 30,
  },
  proceedText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  mapModalBox: {
    width: '90%',
    height: '60%',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: '20%',
  },
  mapContainer: {
    width: '100%',
    flex: 1,
    backgroundColor: theme.input, // Light blue to simulate map
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
  },
  mapMarker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  depotMarker: { backgroundColor: '#37474f' }, // Dark grey for depot
  locationMarker: { backgroundColor: '#d32f2f' }, // Red for customer locations
  modalCancel: {
    marginTop: 10,
    padding: 10,
  },
  mapModalBox: {
    width: '90%',
    height: '60%',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  mapContainer: {
    width: '100%',
    flex: 1,
    backgroundColor: theme.input, // Light blue to simulate map
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
  },
  mapMarker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  depotMarker: { backgroundColor: '#37474f' }, // Dark grey for depot
  locationMarker: { backgroundColor: '#d32f2f' }, // Red for customer locations

  modalBox: {
    width: "85%",
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20, color: theme.text },
  modalOption: {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    backgroundColor: theme.primary,
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
  modalCancelText: { color: theme.textSecondary, fontSize: 16 },
});
