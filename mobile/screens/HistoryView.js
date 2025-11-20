// screens/HistoryView.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const HistoryView = ({ salesHistory = [] }) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.dashboardHeader}>Sales History</Text>
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
        <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 20 }}>No sales history yet.</Text>
      )}
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  dashboardHeader: { fontSize: 22, fontWeight: 'bold', color: theme.text, marginBottom: 16 },
  historyCard: { backgroundColor: theme.card, padding: 14, borderRadius: 12, marginBottom: 12, elevation: 1 },
  historyRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  historyLabel: { fontWeight: "600", color: theme.textSecondary || '#6b7280' },
  historyValue: { color: theme.text || '#111827' },
});

export default HistoryView;