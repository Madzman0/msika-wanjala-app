import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

// Dummy Data for past purchases eligible for return
const PURCHASES_DATA = [
  { id: 'p1', name: 'Fresh Veg Box', price: 5000, supplier: 'Green Farm Ltd', purchaseDate: '2023-10-25', image: require('../assets/product1.jpg'), status: 'delivered' },
  { id: 'p2', name: 'Smartphone Order', price: 25000, supplier: 'Tech Hub', purchaseDate: '2023-10-22', image: require('../assets/product4.jpg'), status: 'delivered' },
  { id: 'p3', name: 'Crocs', price: 15000, supplier: 'Fashion Store', purchaseDate: '2023-09-15', image: require('../assets/product5.jpg'), status: 'return_period_expired' },
  { id: 'p4', name: 'Soyabeans', price: 10000, supplier: 'Agri Export', purchaseDate: '2023-10-28', image: require('../assets/product3.jpg'), status: 'request_pending' },
];

export default function RefundRequestScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [purchases, setPurchases] = useState(PURCHASES_DATA);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reason, setReason] = useState('');
  const [explanation, setExplanation] = useState('');

  const openRequestModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleSubmitRequest = () => {
    if (!reason.trim() || !explanation.trim()) {
      Alert.alert("Incomplete", "Please provide a reason and explanation for your request.");
      return;
    }

    // Simulate API call
    setPurchases(prev => prev.map(p =>
      p.id === selectedItem.id ? { ...p, status: 'request_pending' } : p
    ));

    setModalVisible(false);
    setReason('');
    setExplanation('');
    Alert.alert("Request Submitted", "Your refund/return request has been submitted for review.");
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'request_pending':
        return { text: 'Pending', style: styles.statusPending };
      case 'return_period_expired':
        return { text: 'Return Period Expired', style: styles.statusExpired };
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refund & Return Requests</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {purchases.map(item => {
          const statusInfo = getStatusInfo(item.status);
          return (
            <View key={item.id} style={styles.itemCard}>
              <Image source={item.image} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>Purchased on: {item.purchaseDate}</Text>
                <Text style={styles.itemMeta}>From: {item.supplier}</Text>
              </View>
              <View style={styles.itemAction}>
                {statusInfo ? (
                  <View style={[styles.statusBadge, statusInfo.style]}>
                    <Text style={styles.statusText}>{statusInfo.text}</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.requestButton} onPress={() => openRequestModal(item)}>
                    <Text style={styles.requestButtonText}>Request Return</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Request Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Submit a Return Request</Text>
            <Text style={styles.modalItemName}>{selectedItem?.name}</Text>
            <TextInput style={styles.input} placeholder="Reason for return (e.g., Damaged, Wrong Item)" value={reason} onChangeText={setReason} placeholderTextColor={theme.textSecondary} />
            <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Please explain the issue in detail" value={explanation} onChangeText={setExplanation} multiline placeholderTextColor={theme.textSecondary} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 }}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.input }]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { marginLeft: 10 }]} onPress={handleSubmitRequest}>
                <Text style={styles.modalButtonText}>Submit Request</Text>
              </TouchableOpacity>
            </View>
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
  itemCard: { flexDirection: 'row', backgroundColor: theme.card, borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center' },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: theme.text },
  itemMeta: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  itemAction: { alignItems: 'flex-end' },
  requestButton: { backgroundColor: theme.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  requestButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  statusPending: { backgroundColor: '#f59e0b' },
  statusExpired: { backgroundColor: '#6b7280' },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: theme.card, borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 8, textAlign: 'center' },
  modalItemName: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginBottom: 16 },
  input: { backgroundColor: theme.input, padding: 12, borderRadius: 8, fontSize: 15, color: theme.text, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  modalButton: { flex: 1, backgroundColor: theme.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});