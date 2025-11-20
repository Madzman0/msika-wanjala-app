// screens/PaymentScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    address,
    buyerName, // We now receive buyerName
    method,
    total,
    items, // We now receive items
    discount = 0,
    deliveryOption,
  } = route.params || {};

  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!address || !method || !items || items.length === 0) {
      Alert.alert("Error", "Missing checkout information. Please go back and try again.");
      return;
    }

    setIsProcessing(true);

    try {
      // In a real app, you would process payment with a gateway here.
      // We simulate success and then create the order in Firestore.

      // Group items by sellerId
      const ordersBySeller = items.reduce((acc, item) => {
        const sellerId = item.sellerId || 'unknown_seller';
        if (!acc[sellerId]) {
          acc[sellerId] = {
            sellerId: sellerId,
            items: [],
            subtotal: 0,
          };
        }
        acc[sellerId].items.push({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.qty || 1,
          imageUrl: item.imageUrl || '',
        });
        acc[sellerId].subtotal += (item.price || 0) * (item.qty || 1);
        return acc;
      }, {});

      // Create a separate order document for each seller
      for (const sellerId in ordersBySeller) {
        const orderData = ordersBySeller[sellerId];
        await addDoc(collection(db, "orders"), {
          ...orderData,
          buyerName: buyerName,
          buyerLocation: address, // Using the main address as buyerLocation
          total: orderData.subtotal, // For now, total is subtotal per seller
          status: 'Pending',
          createdAt: serverTimestamp(),
        });

        // Create a notification for the seller
        await addDoc(collection(db, "notifications"), {
          sellerId: sellerId,
          text: `You have a new order from ${buyerName} for ${orderData.items.length} item(s).`,
          type: 'new_order',
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      // Simulate a delay for payment processing
      setTimeout(() => {
        setIsProcessing(false);
        navigation.replace("ConfirmationScreen", route.params);
      }, 1500);

    } catch (error) {
      console.error("Order creation failed: ", error);
      Alert.alert("Order Failed", "There was an issue creating your order. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Payment</Text>
        <View style={{width: 24}} />
      </View>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Total to Pay</Text>
        <Text style={styles.summaryTotal}>MWK {total.toLocaleString()}</Text>
        <Text style={styles.summaryMethod}>via {method}</Text>
      </View>

      <TouchableOpacity
        style={[styles.payBtn, isProcessing && { backgroundColor: "#ccc" }]}
        onPress={handlePayment}
        disabled={isProcessing}
      >
        {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.payText}>Confirm & Pay</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const getStyles = (theme) => StyleSheet.create({
    container: { flexGrow: 1, padding: 18, backgroundColor: theme.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: theme.text },
    summaryCard: { backgroundColor: theme.card, borderRadius: 14, padding: 20, alignItems: 'center', marginVertical: 20 },
    summaryTitle: { fontSize: 16, color: theme.textSecondary },
    summaryTotal: { fontSize: 36, fontWeight: 'bold', color: theme.primary, marginVertical: 8 },
    summaryMethod: { fontSize: 16, color: theme.text, fontStyle: 'italic' },
    payBtn: { backgroundColor: theme.primary, padding: 16, borderRadius: 12, alignItems: "center", marginTop: 24 },
    payText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
});