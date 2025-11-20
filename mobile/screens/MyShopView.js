import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

const MyShopView = ({ products, shopName, slogan, shopBanner, shopAvatar, isLoading, verificationStatus, isLive, handleGoLivePress, handleStartBiddingPress, ratingSummary, navigation, handleEndLive }) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const isVerified = verificationStatus === 'verified';
  const { avgRating } = ratingSummary();
  const totalSales = products.reduce((sum, p) => sum + p.sales, 0);

  return (
    <ScrollView style={styles.shopContainer}>
      {/* Shop Header */}
      <View style={styles.shopHeader}>
        <View style={styles.shopBanner}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Image source={shopBanner ? { uri: shopBanner } : null} style={styles.imageStyle} />
          )}
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('SellerSettingsScreen', { salesHistory: [] })}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.shopInfo}>
          <View style={styles.shopAvatar}>
            {isLoading ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <Image source={shopAvatar ? { uri: shopAvatar } : null} style={styles.imageStyle} />
            )}
          </View>
          <View style={styles.shopNameContainer}>
            <Text style={styles.shopName}>{shopName}</Text>
            {isVerified ? (
              <View style={[styles.verificationBadge, styles.verifiedBadge]}>
                <Ionicons name="shield-checkmark" size={14} color="#fff" />
                <Text style={styles.verificationText}>Verified</Text>
              </View>
            ) : (
              <View style={[styles.verificationBadge, styles.unverifiedBadge]}>
                <Text style={styles.verificationText}>Unverified</Text>
              </View>
            )}
          </View>
          <Text style={styles.shopSlogan}>{slogan || 'Your one-stop shop for quality goods.'}</Text>
        </View>
      </View>

      <View style={{ opacity: isVerified ? 1 : 0.3 }}>
        {/* Stats & Actions */}
        <View style={styles.shopStatsRow}>
          <View style={styles.shopStatItem}><Text style={styles.shopStatValue}>{products.length}</Text><Text style={styles.shopStatLabel}>Products</Text></View>
          <View style={styles.shopStatItem}><Text style={styles.shopStatValue}>{totalSales}</Text><Text style={styles.shopStatLabel}>Sales</Text></View>
          <View style={styles.shopStatItem}><Text style={styles.shopStatValue}>{avgRating} ★</Text><Text style={styles.shopStatLabel}>Rating</Text></View>
        </View>

        <TouchableOpacity 
          style={[styles.liveButton, isLive && styles.endLiveButton]} 
          onPress={isLive ? handleEndLive : handleGoLivePress} 
          disabled={!isVerified}
        >
          <Ionicons name={isLive ? "stop-circle-outline" : "radio"} size={20} color="#fff" />
          <Text style={styles.liveButtonText}>
            {isLive ? "End Live Session" : "Go Live"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bidButton} onPress={handleStartBiddingPress} disabled={!isVerified}>
          <Ionicons name="hammer" size={20} color="#fff" />
          <Text style={styles.bidButtonText}>Start Bidding</Text>
        </TouchableOpacity>

        {/* Listings */}
        <Text style={styles.shopSectionTitle}>My Listings</Text>
        {products.map((p) => (
          <View key={p.id} style={styles.modernProductRow}>
            <Image source={{ uri: p.imageUrl || "https://placekitten.com/200/200" }} style={styles.modernProductThumb} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: "700", fontSize: 16 }}>{p.name}</Text>
              <Text style={{ color: "#777", marginTop: 2 }}>{p.category} • MWK {p.price.toLocaleString()}</Text>
              <Text style={{ color: "#555", marginTop: 4 }}>Sales: {p.sales || 0} | Likes: {p.likes || 0}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProductScreen', { product: p })} disabled={!isVerified}>
              <Ionicons name="create-outline" size={22} color={theme.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {!isVerified && (
        <View style={styles.verificationOverlay}>
          <Ionicons name="lock-closed" size={40} color={theme.primary} />
          <Text style={styles.overlayText}>Verify Seller Identity to unlock features</Text>
          <TouchableOpacity style={styles.overlayButton} onPress={() => navigation.navigate('SellerSettingsScreen', { screen: 'SellerVerificationScreen' })}>
            <Text style={styles.overlayButtonText}>Verify Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  shopContainer: { flex: 1, backgroundColor: "#f9fafb" },
  shopHeader: { alignItems: 'center', marginBottom: 16 },
  shopBanner: { width: '100%', height: 150, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
  shopInfo: { alignItems: 'center', marginTop: -50, width: '100%' },
  shopAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#fff', backgroundColor: '#d1d5db' },
  settingsButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8, borderRadius: 20,
  },
  imageStyle: { width: '100%', height: '100%' },
  shopNameContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  shopName: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  verificationBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
  verifiedBadge: { backgroundColor: '#16a34a' },
  unverifiedBadge: { backgroundColor: '#ef4444' },
  verificationText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  shopSlogan: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  shopStatsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, elevation: 2, marginBottom: 16 },
  shopStatItem: { alignItems: 'center' },
  shopStatValue: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  shopStatLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  liveButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ef4444',
    marginHorizontal: 16, paddingVertical: 12, borderRadius: 12, elevation: 3, marginBottom: 20,
  },
  endLiveButton: { backgroundColor: '#4b5563' }, // A darker grey for ending
  bidButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ff6f00',
    marginHorizontal: 16, paddingVertical: 12, borderRadius: 12, elevation: 3, marginBottom: 16,
  },
  bidButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  liveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  shopSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginHorizontal: 16, marginBottom: 12 },
  modernProductRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 14, marginHorizontal: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  modernProductThumb: { width: 80, height: 80, borderRadius: 12, backgroundColor: "#f3f4f6" },
  editButton: { padding: 8 },
  verificationOverlay: { position: 'absolute', top: 220, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(249, 250, 251, 0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  overlayText: { fontSize: 16, fontWeight: 'bold', color: '#374151', textAlign: 'center', marginTop: 12 },
  overlayButton: { backgroundColor: theme.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, marginTop: 16 },
  overlayButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default MyShopView;