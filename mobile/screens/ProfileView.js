import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, useWindowDimensions, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

const ProfileView = ({ initials, user, openInfoModal, setActiveTab, handleLogout, handleChangePassword, handleUploadPhoto, profileImage, isUploading, emailVerified, handleSendVerificationEmail, handleEditProfile, handleDeleteAccount, handleManageConnectedAccounts, handleManagePhone }) => (
  <ProfileViewContent {...{ initials, user, openInfoModal, setActiveTab, handleLogout, handleChangePassword, handleUploadPhoto, profileImage, isUploading, emailVerified, handleSendVerificationEmail, handleEditProfile, handleDeleteAccount, handleManageConnectedAccounts, handleManagePhone }} />
);

const ProfileViewContent = ({ initials, user, openInfoModal, setActiveTab, handleLogout, handleChangePassword, handleUploadPhoto, profileImage, isUploading, emailVerified, handleSendVerificationEmail, handleEditProfile, handleDeleteAccount, handleManageConnectedAccounts, handleManagePhone }) => {
  const { width } = useWindowDimensions();
  const isWideScreen = width >= 768;
  const { isDarkMode, toggleTheme, theme } = useContext(ThemeContext);

  const styles = getStyles(theme, isWideScreen);

  const content = (
    <>
      {profileImage ? (
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
      ) : (
        <View style={styles.profileBigCircle}>
          <Text style={{ fontWeight: 'bold', fontSize: 28, color: theme.text }}>{initials}</Text>
        </View>
      )}
      <Text style={styles.profileSubtitle}>Buyer Account</Text>
      <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadPhoto} disabled={isUploading}>
        {isUploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="camera" size={18} color="#fff" />
        )}
        <Text style={[styles.uploadBtnText, isWideScreen && styles.smallUploadBtnText]}>{isUploading ? 'Uploading...' : (profileImage ? 'Change Photo' : 'Upload Photo')}</Text>
      </TouchableOpacity>
      <View style={[styles.infoCard, isWideScreen && styles.gridItem]}>
      <Text style={styles.infoLabel}>Your Member ID</Text>
      <Text style={styles.infoValue}>{user?.memberId || 'N/A'}</Text>

      <Text style={styles.infoLabel}>Email</Text>
      <View style={styles.rowBetween}>
        <Text style={styles.infoValue}>{user?.email || 'No email found'}</Text>
        {user?.email && user?.email !== 'N/A' && (
          emailVerified ? (
            <View style={[styles.statusBadge, styles.verifiedBadge]}>
              <Text style={styles.statusBadgeText}>Verified</Text>
            </View>
          ) : (
            <TouchableOpacity style={[styles.statusBadge, styles.unverifiedBadge]} onPress={handleSendVerificationEmail}>
              <Text style={styles.statusBadgeText}>Verify email</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <Text style={styles.infoLabel}>Linked Mobile</Text>
      <TouchableOpacity onPress={handleManagePhone}>
        {user?.phone ? (
          <Text style={styles.infoValue}>{user.phone}</Text>
        ) : (
          <Text style={styles.linkText}>Enter Mobile Number</Text>
        )}
      </TouchableOpacity>
    </View>
      <View style={[styles.section, isWideScreen && styles.gridItem]}>
      <TouchableOpacity style={styles.profileOption} onPress={handleEditProfile}>
        <Text style={styles.profileOptionText}>More account settings</Text>
        <Ionicons name="chevron-forward" size={18} color="#777" />
      </TouchableOpacity>
    </View>
      <View style={[styles.section, isWideScreen && styles.gridItem]}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.profileOption}>
          <Text style={styles.profileOptionText}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: "#ffad75" }}
            thumbColor={isDarkMode ? "#ff6f00" : "#f4f3f4"}
          />
        </View>
      </View>
      <View style={[styles.section, isWideScreen && styles.gridItem]}>
      <Text style={styles.sectionTitle}>Account Security</Text>
      <TouchableOpacity style={styles.profileOption} onPress={handleChangePassword}>
        <Text style={styles.profileOptionText}>Change Password</Text>
        <Ionicons name="chevron-forward" size={18} color="#777" />
      </TouchableOpacity>
      <TouchableOpacity
          style={styles.profileOption}
          onPress={handleManageConnectedAccounts}>
          <Text style={styles.profileOptionText}>Manage Connected Accounts</Text>
          <Ionicons name="chevron-forward" size={18} color="#777" />
        </TouchableOpacity>

      <TouchableOpacity style={[styles.profileOption, { borderBottomWidth: 0 }]} onPress={handleDeleteAccount}>
        <Text style={[styles.profileOptionText, { color: '#ef4444' }]}>Delete Account</Text>
        <Ionicons name="trash-outline" size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
      <View style={[styles.section, isWideScreen && styles.gridItem]}>
      <Text style={styles.sectionTitle}>Finance Account</Text>
      <TouchableOpacity style={styles.profileOption} onPress={() => setActiveTab('History')}>
        <Text style={styles.profileOptionText}>My Transactions</Text>
        <Ionicons name="chevron-forward" size={18} color="#777" />
      </TouchableOpacity>
    </View>
      <View style={[styles.section, isWideScreen && styles.gridItem]}>
      <Text style={styles.sectionTitle}>Grow with Us</Text>
      <TouchableOpacity style={styles.profileOption}>
        <Ionicons name="gift-outline" size={20} color="#16a34a" style={{ marginRight: 10 }} />
        <Text style={styles.profileOptionText}>Refer a Friend & Earn</Text>
        <Ionicons name="chevron-forward" size={18} color="#777" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.profileOption}>
        <Ionicons name="logo-facebook" size={20} color="#1877f2" style={{ marginRight: 10 }} />
        <Text style={styles.profileOptionText}>Follow us on Social Media</Text>
        <Ionicons name="chevron-forward" size={18} color="#777" />
      </TouchableOpacity>
    </View>
      <TouchableOpacity onPress={handleLogout} style={[styles.logoutButton, isWideScreen && styles.gridItem]}>
      <Ionicons name="log-out-outline" size={20} color="red" />
      <Text style={[styles.profileOptionText, { color: 'red', marginLeft: 10 }]}>Logout</Text>
    </TouchableOpacity>
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.profileHeader}>
        <Text style={styles.profileName}>{user?.name || 'Guest'}</Text>
      </View>
      {isWideScreen ? <View style={styles.gridContainer}>{content}</View> : content}
    </ScrollView>
  );
};

const getStyles = (theme, isWideScreen) => StyleSheet.create({
  scrollContainer: { padding: 20, paddingBottom: 120, backgroundColor: theme.background },
  profileHeader: { alignItems: 'center', marginBottom: 20, width: '100%' },
  profileBigCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  profileName: { fontSize: 20, fontWeight: 'bold', color: theme.text },
  profileSubtitle: { color: theme.textSecondary, marginTop: 2 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 8 },
  uploadBtnText: { color: '#fff', marginLeft: 5, fontSize: 12, fontWeight: 'bold' },
  infoCard: { backgroundColor: theme.card, padding: 15, borderRadius: 12, marginBottom: 20 },
  infoLabel: { fontSize: 14, color: theme.textSecondary, marginTop: 10, fontWeight: 'bold' },
  infoValue: { fontSize: 14, color: theme.text, marginTop: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  linkText: { color: theme.primary, fontWeight: 'bold' },
  section: { marginBottom: 20, backgroundColor: theme.card, borderRadius: 12, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', padding: 12, color: theme.text, borderBottomWidth: 1, borderColor: theme.border },
  profileOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: theme.border },
  profileOptionText: { fontSize: 15, color: theme.text },
  // Status Badge Styles
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  verifiedBadge: { backgroundColor: '#166534' }, // Green
  unverifiedBadge: { backgroundColor: '#991b1b' }, // Red
  statusBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    borderRadius: 12,
  },
  // --- Responsive Grid Styles ---
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', marginBottom: 20 },

});

export default ProfileView;