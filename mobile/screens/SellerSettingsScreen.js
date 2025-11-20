// screens/SellerSettingsScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, SafeAreaView, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { getAuth, sendPasswordResetEmail, signOut, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { app, db } from '../firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';

// Reusable components for structure
const Section = ({ title, children, styles }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const SettingRow = ({ label, value, onPress, children, theme, styles }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowValueContainer}>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {children}
      {onPress && <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />}
    </View>
  </TouchableOpacity>
);

export default function SellerSettingsScreen({ route, navigation }) {
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successModalText, setSuccessModalText] = useState('');
  // State for Delete Account Modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [passwordForDelete, setPasswordForDelete] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);


  // Dummy state for toggles
  const [notifications, setNotifications] = useState({
    newOrders: true,
    stockAlerts: true,
    promotions: false,
  });

  const handleChangePassword = async () => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user && user.email) {
      try {
        await sendPasswordResetEmail(auth, user.email);
        setSuccessModalText("Check your email to change your password");
        setSuccessModalVisible(true);
      } catch (error) {
        console.error("Password Reset Error:", error);
        Alert.alert("Error", "Failed to send reset email. Please try again.");
      }
    } else {
      Alert.alert("Error", "Could not find user email. Please try again or contact support.");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            const auth = getAuth();
            try {
              await signOut(auth);
              navigation.replace("GeneralLogin");
            } catch (error) {
              console.error("Logout failed", error);
              Alert.alert("Logout Failed", "An error occurred while logging out.");
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    // This function just opens the confirmation modal
    setDeleteModalVisible(true);
    setPasswordForDelete(''); // Clear password field
    setDeleteError(''); // Clear any previous errors
  };

  const confirmAndDeleteAccount = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !passwordForDelete) {
      setDeleteError("Password is required.");
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      // Re-authenticate the user for this sensitive operation
      const credential = EmailAuthProvider.credential(user.email, passwordForDelete);
      await reauthenticateWithCredential(user, credential);

      // Re-authentication successful, now delete the user data and account
      const userDocRef = doc(db, "users", user.uid);
      await deleteDoc(userDocRef); // Delete from Firestore
      await deleteUser(user); // Delete from Firebase Auth

      // Close modal and navigate
      setDeleteModalVisible(false);
      navigation.replace("GeneralLogin");

      // Show success message after navigation
      Alert.alert("Account Deleted", "Your account has been permanently deleted.");

    } catch (error) {
      console.error("Account Deletion Error:", error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setDeleteError("Wrong password. Please try again.");
      } else {
        setDeleteError("An error occurred. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop Settings</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <Section title="🛍️ Shop Profile" styles={styles}>
          <SettingRow label="Shop Name & Slogan" onPress={() => navigation.navigate('EditShopProfileScreen')} theme={theme} styles={styles} />
          <SettingRow label="Shop Banner & Avatar" onPress={() => Alert.alert("Navigate", "Open Image Uploader")} theme={theme} styles={styles} />
          <SettingRow label="Business Information" onPress={() => navigation.navigate('BusinessInfoScreen')} theme={theme} styles={styles} />
        </Section>

        <Section title="💰 Payouts & Finance" styles={styles}>
          <SettingRow label="Payout Methods" value="Bank Account" onPress={() => navigation.navigate('PayoutMethodsScreen')} theme={theme} styles={styles} />
          <SettingRow label="Transaction History" onPress={() => navigation.navigate('SellerTransactionHistoryScreen', { salesHistory: route.params?.salesHistory || [] })} theme={theme} styles={styles} />
        </Section>

        <Section title="🚚 Store Policies" styles={styles}>
          <SettingRow label="Return Policy" onPress={() => navigation.navigate('ReturnPolicyScreen')} theme={theme} styles={styles} />
          <SettingRow label="Shipping Information" onPress={() => navigation.navigate('ShippingInfoScreen')} theme={theme} styles={styles} />
        </Section>

        <Section title="🔔 Notifications" styles={styles}>
          <SettingRow label="New Order Alerts" theme={theme} styles={styles}>
            <Switch value={notifications.newOrders} onValueChange={(v) => setNotifications(p => ({...p, newOrders: v}))} trackColor={{ false: "#767577", true: theme.primary }} thumbColor={"#fff"} />
          </SettingRow>
          <SettingRow label="Low Stock Warnings" theme={theme} styles={styles}>
            <Switch value={notifications.stockAlerts} onValueChange={(v) => setNotifications(p => ({...p, stockAlerts: v}))} trackColor={{ false: "#767577", true: theme.primary }} thumbColor={"#fff"} />
          </SettingRow>
        </Section>

        <Section title="🔐 Account Security" styles={styles}>
          <SettingRow label="Change Password" onPress={handleChangePassword} theme={theme} styles={styles} />
          <SettingRow label="Connected Accounts" onPress={() => navigation.navigate('ConnectedAccountsScreen')} theme={theme} styles={styles} />
          <SettingRow label="Seller Verification" onPress={() => navigation.navigate('SellerVerificationScreen')} theme={theme} styles={styles} />
        </Section>

        <Section title="⚙️ App Settings" styles={styles}>
          <SettingRow label="Dark Mode" theme={theme} styles={styles}>
            <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ false: "#767577", true: theme.primary }} thumbColor={"#fff"} />
          </SettingRow>
          <SettingRow label="Help Center" onPress={() => navigation.navigate('HelpCenter')} theme={theme} styles={styles} />
          <SettingRow label="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicyScreen')} theme={theme} styles={styles} />
          <SettingRow label="Terms of Service" onPress={() => navigation.navigate('TermsOfServiceScreen')} theme={theme} styles={styles} />
          <SettingRow label="Delete Account" onPress={handleDeleteAccount} theme={theme} styles={styles} />
        </Section>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <Text style={styles.successModalText}>{successModalText}</Text>
            <TouchableOpacity style={styles.successModalButton} onPress={() => setSuccessModalVisible(false)}>
              <Text style={styles.closeButtonText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.modalTitle}>Confirm Account Deletion</Text>
            <Text style={styles.deleteInfoText}>
              This is a permanent action. To confirm, please enter your password.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={passwordForDelete}
              onChangeText={setPasswordForDelete}
            />
            {deleteError ? <Text style={styles.deleteErrorText}>{deleteError}</Text> : null}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 }}>
              <TouchableOpacity style={[styles.modalButton, { flex: 1, marginRight: 8, backgroundColor: theme.input }]} onPress={() => setDeleteModalVisible(false)}>
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { flex: 1, marginLeft: 8, backgroundColor: '#b91c1c' }]} onPress={confirmAndDeleteAccount} disabled={isDeleting}>
                {isDeleting ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>Delete</Text>}
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
  scrollContainer: { paddingBottom: 50 },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionBody: {
    backgroundColor: theme.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  rowLabel: {
    fontSize: 16,
    color: theme.text,
  },
  rowValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 16,
    color: theme.textSecondary,
    marginRight: 8,
  },
  logoutButton: {
    margin: 12,
    marginTop: 30,
    backgroundColor: '#ef444420',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Success Modal Styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  successModalContent: { width: "85%", backgroundColor: "#166534", borderRadius: 10, padding: 25, alignItems: "center" },
  successModalText: { color: "#fff", fontSize: 16, textAlign: 'center', marginBottom: 20 },
  successModalButton: { backgroundColor: "#22c55e", paddingHorizontal: 30, paddingVertical: 10, borderRadius: 8 },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
  // Delete Modal Styles
  deleteModalContent: { width: '85%', backgroundColor: theme.card, borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 10, textAlign: 'center' },
  deleteInfoText: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginBottom: 16 },
  input: { backgroundColor: theme.input, padding: 12, borderRadius: 8, fontSize: 15, color: theme.text, width: '100%' },
  deleteErrorText: { color: '#ef4444', marginTop: 10, textAlign: 'center' },
  modalButton: { padding: 12, borderRadius: 8, alignItems: 'center' },
  modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});