// screens/SellerTransactionHistoryScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

const SellerTransactionHistoryScreen = ({ route, navigation }) => {
  const { salesHistory = [] } = route.params;
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {salesHistory.length > 0 ? salesHistory.map(item => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.historyRow}>
              <Text style={styles.historyLabel}>Buyer:</Text>
              <Text style={styles.historyValue}>{item.buyer}</Text>
            </View>
            <View style={styles.historyRow}>
              <Text style={styles.historyLabel}>Amount:</Text>
              <Text style={styles.historyValue}>MWK {item.amount.toLocaleString()}</Text>
            </View>
            <View style={styles.historyRow}>
              <Text style={styles.historyLabel}>Date:</Text>
              <Text style={styles.historyValue}>{new Date(item.time).toLocaleDateString()}</Text>
            </View>
            <View style={styles.historyRow}>
              <Text style={styles.historyLabel}>Status:</Text>
              <Text style={[styles.historyValue, { color: item.status === 'Pending' ? '#f59e0b' : '#16a34a' }]}>{item.status}</Text>
            </View>
          </View>
        )) : (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 20 }}>No transaction history yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  historyCard: { backgroundColor: theme.card, padding: 14, borderRadius: 12, marginBottom: 12, elevation: 1 },
  historyRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  historyLabel: { fontWeight: "600", color: theme.textSecondary || '#6b7280' },
  historyValue: { color: theme.text || '#111827' },
});

export default SellerTransactionHistoryScreen;