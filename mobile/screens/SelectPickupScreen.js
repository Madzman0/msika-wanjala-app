// screens/SelectPickupScreen.js
import React, { useContext, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

// Mock data for nearby transporters. In a real app, this would be fetched based on location.
const NEARBY_TRANSPORTERS = [
  { id: 'T1', name: 'Mike J.', vehicle: 'Motorbike', rating: 4.8, distance: '1.2km away' },
  { id: 'T2', name: 'Express Deliveries', vehicle: 'Car', rating: 4.9, distance: '2.5km away' },
  { id: 'T3', name: 'Fast Movers', vehicle: 'Truck', rating: 4.5, distance: '3.1km away' },
];

export default function SelectPickupScreen({ route, navigation }) {
  const { orders } = route.params;
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [generatedQRs, setGeneratedQRs] = useState([]);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedQrData, setSelectedQrData] = useState(null);
  const [transporterModalVisible, setTransporterModalVisible] = useState(false);
  const [orderForNotification, setOrderForNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter for orders that are ready for pickup (e.g., status is 'Pending')
  const ordersForPickup = orders
    .filter(order => order.status === 'Pending')
    .filter(order => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const buyerNameMatch = order.buyerName.toLowerCase().includes(query);
      const orderIdMatch = order.id.toLowerCase().includes(query);
      return buyerNameMatch || orderIdMatch;
    });

  const handleSelectOrder = (order) => {
    Alert.alert(
      "Confirm Pickup Notification",
      `Do you want to notify nearby transporters for the order for ${order.buyerName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Notify",
          onPress: () => generateQrForOrder(order),
        },
      ]
    );
  };

  const generateQrForOrder = (order) => {
    const qrData = {
      orderId: order.id,
      transactionId: `TRN-${order.id}-${Date.now()}`,
      buyerId: order.buyerId || 'user_placeholder_id', // Assuming buyerId is on the order
      buyerName: order.buyerName,
      destinationAddress: order.buyerLocation,
      productName: order.items[0]?.name || 'Multiple Items', // Use first item name as reference
    };

    // Avoid adding duplicate QRs for the same order
    if (!generatedQRs.some(qr => qr.orderId === order.id)) {
      setGeneratedQRs(prevQRs => [...prevQRs, qrData]);
    }

    // Open the transporter list modal instead of just showing an alert
    setOrderForNotification(order);
    setTransporterModalVisible(true);
  };

  const handleNotifyTransporter = (transporter) => {
    // Simulate notifying the transporter
    Alert.alert(
      "Transporter Notified",
      `${transporter.name} has been notified about the pickup for order ${orderForNotification?.id}.`
    );
    // Close the modal after notification
    setTransporterModalVisible(false);
  };

  const viewQrCode = (qrData) => {
    setSelectedQrData(qrData);
    setQrModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Order for Pickup</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.infoText}>
          Choose an order from the list below to notify a nearby transporter for pickup.
        </Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by buyer name or order ID..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {ordersForPickup.length > 0 ? (
          ordersForPickup.map(order => (
            <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => handleSelectOrder(order)}>
              <Image source={{ uri: order.items[0]?.imageUrl || 'https://placekitten.com/200/200' }} style={styles.itemImage} />
              <View style={styles.orderDetails}>
                <Text style={styles.buyerName}>Order for: {order.buyerName}</Text>
                <Text style={styles.itemText}>{order.items.length} item(s) • MWK {order.total.toLocaleString()}</Text>
                <Text style={styles.addressText}>{order.buyerLocation}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noOrdersText}>
            {searchQuery ? `No results for "${searchQuery}"` : 'No pending orders available for pickup.'}
          </Text>
        )}
      </ScrollView>

      {generatedQRs.length > 0 && (
        <View style={styles.qrPanel}>
          <Text style={styles.qrPanelTitle}>Generated Pickup QRs</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.qrScroll}>
            {generatedQRs.map(qr => (
              <TouchableOpacity key={qr.transactionId} style={styles.qrCard} onPress={() => viewQrCode(qr)}>
                <Ionicons name="qr-code" size={40} color={theme.primary} />
                <Text style={styles.qrCardText} numberOfLines={2}>{qr.productName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* QR Code Viewing Modal */}
      <Modal
        visible={qrModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContent}>
            <Text style={styles.qrModalTitle}>Scan for Pickup</Text>
            <View style={styles.qrCodeContainer}>
              {/* This is a visual simulation of a QR code */}
              {Array.from({ length: 15 }).map((_, rowIndex) => (
                <View key={rowIndex} style={{ flexDirection: 'row' }}>
                  {Array.from({ length: 15 }).map((_, colIndex) => (
                    <View key={colIndex} style={{ width: 12, height: 12, backgroundColor: Math.random() > 0.5 ? theme.text : theme.card }} />
                  ))}
                </View>
              ))}
            </View>
            <Text style={styles.qrInfoText}>Product: {selectedQrData?.productName}</Text>
            <Text style={styles.qrInfoText}>For: {selectedQrData?.buyerName}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setQrModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Transporter Notification Modal */}
      <Modal
        visible={transporterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTransporterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.transporterModalContent}>
            <Text style={styles.modalTitle}>Notify a Nearby Transporter</Text>
            <Text style={styles.modalSubtitle}>Select a transporter to send a pickup request for order {orderForNotification?.id}.</Text>
            
            <ScrollView>
              {NEARBY_TRANSPORTERS.map(transporter => (
                <View key={transporter.id} style={styles.transporterRow}>
                  <View style={styles.transporterInfo}>
                    <Text style={styles.transporterName}>{transporter.name}</Text>
                    <Text style={styles.transporterDetails}>{transporter.vehicle} • {transporter.rating} ★ • {transporter.distance}</Text>
                  </View>
                  <TouchableOpacity style={styles.notifyButton} onPress={() => handleNotifyTransporter(transporter)}>
                    <Text style={styles.notifyButtonText}>Notify</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.closeButton, {backgroundColor: theme.input, marginTop: 16}]} 
              onPress={() => setTransporterModalVisible(false)}>
              <Text style={[styles.closeButtonText, {color: theme.text}]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  scrollContainer: { padding: 16 },
  infoText: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginBottom: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.input,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, color: theme.text, fontSize: 15 },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  orderDetails: { flex: 1 },
  buyerName: { fontSize: 16, fontWeight: 'bold', color: theme.text },
  itemText: { fontSize: 14, color: theme.textSecondary, marginTop: 2 },
  addressText: { fontSize: 13, color: theme.primary, marginTop: 4, fontWeight: '600' },
  noOrdersText: { textAlign: 'center', color: theme.textSecondary, marginTop: 40, fontSize: 16 },
  qrPanel: { borderTopWidth: 1, borderTopColor: theme.border, padding: 16, backgroundColor: theme.background },
  qrPanelTitle: { fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 12 },
  qrScroll: { paddingRight: 16 },
  qrCard: { width: 120, height: 120, backgroundColor: theme.card, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12, padding: 8 },
  qrCardText: { marginTop: 8, fontWeight: '600', color: theme.text, textAlign: 'center' },
  // QR Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  qrModalContent: { width: '85%', backgroundColor: theme.card, borderRadius: 16, padding: 24, alignItems: 'center' },
  qrModalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 20 },
  qrCodeContainer: { padding: 10, backgroundColor: theme.card, borderWidth: 6, borderColor: theme.border },
  qrInfoText: { fontSize: 15, color: theme.textSecondary, marginTop: 16, textAlign: 'center' },
  closeButton: { backgroundColor: theme.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10, marginTop: 24 },
  closeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  // Transporter Modal Styles
  transporterModalContent: { width: '95%', maxHeight: '80%', backgroundColor: theme.card, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginBottom: 20 },
  transporterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  transporterInfo: { flex: 1 },
  transporterName: { fontSize: 16, fontWeight: '600', color: theme.text },
  transporterDetails: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  notifyButton: { backgroundColor: theme.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  notifyButtonText: { color: '#fff', fontWeight: 'bold' },
});