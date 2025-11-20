// screens/RoleSelectionLoginScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

const roleDetails = {
  buyer: {
    icon: 'cart-outline',
    title: 'Buyer Account',
    description: 'Browse products, make purchases, and track your orders.',
  },
  seller: {
    icon: 'storefront-outline',
    title: 'Seller Account',
    description: 'Manage your shop, list products, and view your sales dashboard.',
  },
  transporter: {
    icon: 'bicycle-outline',
    title: 'Transporter Account',
    description: 'Find and manage delivery jobs.',
  },
  depot: {
    icon: 'business-outline',
    title: 'Depot Account',
    description: 'Manage incoming and outgoing parcels.',
  },
};

export default function RoleSelectionLoginScreen({ route }) {
  const { availableRoles, setRole } = route.params;
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="people-circle-outline" size={64} color={theme.primary} />
        <Text style={styles.headerTitle}>Select Your Role</Text>
        <Text style={styles.subtitle}>You have multiple roles associated with this account. Choose which one you'd like to use now.</Text>

        {availableRoles.map(role => {
          const details = roleDetails[role] || { icon: 'person-outline', title: role, description: 'Access your account.' };
          return (
            <TouchableOpacity key={role} style={styles.roleCard} onPress={() => setRole(role)}>
              <Ionicons name={details.icon} size={32} color={theme.primary} />
              <View style={styles.roleTextContainer}>
                <Text style={styles.roleTitle}>{details.title}</Text>
                <Text style={styles.roleDescription}>{details.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, justifyContent: 'center' },
  content: { padding: 20, alignItems: 'center' },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
    elevation: 2,
  },
  roleTextContainer: { flex: 1, marginHorizontal: 16 },
  roleTitle: { fontSize: 17, fontWeight: 'bold', color: theme.text },
  roleDescription: { fontSize: 13, color: theme.textSecondary, marginTop: 4 },
});