import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

// Dummy product data
const featuredProducts = [
  {
    id: "1",
    name: "Fresh Maize",
    desc: "Organic farm produce",
    type: "Farm Produce",
    seller: "Farmer John",
    location: "Lilongwe",
    price: "MWK 5,000",
    images: [require("../assets/maize.png")],
  },
  {
    id: "2",
    name: "Cement Bags",
    desc: "Quality construction material",
    type: "Construction",
    seller: "BuildPro",
    location: "Blantyre",
    price: "MWK 12,000",
    images: [require("../assets/cement.png")],
  },
];

// Dummy seller data
const topSellers = [
  {
    id: "1",
    name: "John Kabade",
    location: "Lilongwe",
    phone: "+265 999 123 456",
    products: 12,
    rating: 4.5,
    profilePic: null,
  },
  {
    id: "2",
    name: "Mary Banda",
    location: "Blantyre",
    phone: "+265 888 654 321",
    products: 8,
    rating: 4.8,
    profilePic: require("../assets/farmer.png"),
  },
];

// Dummy dashboard data
const dashboardStats = [
  { id: 1, label: "Products Listed", count: 120, icon: "cube" },
  { id: 2, label: "Active Sellers", count: 45, icon: "people" },
  { id: 3, label: "Categories", count: 10, icon: "list" },
  { id: 4, label: "Major Cities", count: 8, icon: "business" },
];

export default function HomeScreen({ navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // simulate auth

  const user = {
    name: "Madzman Kapopo",
    profilePic: null,
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // Toggle auth for demo (optional)
  const handleAuthToggle = () => setIsLoggedIn(!isLoggedIn);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require("../assets/logo.png")} style={styles.logo} />
            <Text style={styles.appName}>Msika Wanjala</Text>
          </View>

          <View style={styles.headerActions}>
            {isLoggedIn ? (
              <TouchableOpacity style={styles.profileCircle}>
                {user.profilePic ? (
                  <Image source={user.profilePic} style={styles.profilePic} />
                ) : (
                  <Text style={styles.initialsText}>{initials}</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.signInButton}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Ionicons name="menu" size={28} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* HERO SECTION */}
        <View style={styles.hero}>
          <Text style={styles.heroTitleTop}>Your Local</Text>
          <Text style={styles.heroTitleBottom}>Marketplace</Text>
          <Text style={styles.heroDesc}>
            Connect with local sellers and discover quality products in your
            community. From fresh farm produce to construction materials - find
            everything you need.
          </Text>

          {!isLoggedIn && (
            <>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Start Shopping</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Become a Seller</Text>
              </TouchableOpacity>
            </>
          )}

          {isLoggedIn && (
            <Text style={{ marginTop: 10, fontSize: 16, fontWeight: "bold", color: "#333" }}>
              Welcome back, {user.name.split(" ")[0]}!
            </Text>
          )}
        </View>

        {/* FEATURED PRODUCTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>View all</Text>
            </TouchableOpacity>
          </View>

          {featuredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image
                source={product.images[0]}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productHeader}>
                <Text style={styles.productName}>{product.name}</Text>
                <Ionicons name="heart-outline" size={26} color="#ff6f00" />
              </View>
              <Text style={styles.productPrice}>{product.price}</Text>
              <Text style={styles.productDesc}>{product.desc}</Text>
              <Text style={styles.productMeta}>
                {product.type} • {product.seller} | {product.location}
              </Text>

              <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.contactButtonText}>Contact Seller</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* TOP SELLERS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Sellers</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>View all sellers</Text>
            </TouchableOpacity>
          </View>

          {topSellers.map((seller) => (
            <View key={seller.id} style={styles.sellerCard}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {seller.profilePic ? (
                  <Image source={seller.profilePic} style={styles.profilePic} />
                ) : (
                  <View style={styles.initialsCircle}>
                    <Text style={styles.initialsText}>
                      {seller.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.sellerName}>{seller.name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="location" size={14} color="#555" />
                    <Text style={styles.sellerLocation}>{seller.location}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.sellerDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="call" size={16} color="#ff6f00" />
                  <Text style={styles.detailText}>{seller.phone}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="cube" size={16} color="#ff6f00" />
                  <Text style={styles.detailText}>{seller.products} products</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="star" size={16} color="#ff6f00" />
                  <Text style={styles.detailText}>{seller.rating} rating</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.showProfileButton}>
                <Text style={styles.showProfileText}>Show Profile</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* DASHBOARD STATS */}
        <View style={styles.dashboard}>
          {dashboardStats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <Ionicons name={stat.icon} size={28} color="#ff6f00" />
              <Text style={styles.statCount}>{stat.count}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* CALL TO ACTION PANEL */}
        <LinearGradient
          colors={["#4caf50", "#ff9800"]}
          style={styles.ctaPanel}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.ctaTitle}>Ready to start selling?</Text>
          <Text style={styles.ctaDesc}>
            Join our growing community of sellers and reach customers across
            Malawi. List your products today and grow your business.
          </Text>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Register as a Seller</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* FOOTER */}
        <View style={styles.footerPanel}>
          <View style={styles.footerHeader}>
            <Image source={require("../assets/logo.png")} style={styles.footerLogo} />
            <Text style={styles.footerAppName}>Msika Wanjala</Text>
          </View>
          <Text style={styles.footerDesc}>
            Connecting local buyers and sellers across Malawi. Building stronger
            communities through trade.
          </Text>

          <View style={styles.footerLinksRow}>
            <View style={styles.footerColumn}>
              <Text style={styles.footerColumnTitle}>Quick Links</Text>
              <Text style={styles.footerLink}>Browse Products</Text>
              <Text style={styles.footerLink}>Find Sellers</Text>
            </View>
            <View style={styles.footerColumn}>
              <Text style={styles.footerColumnTitle}>For Sellers</Text>
              <Text style={styles.footerLink}>Start Selling</Text>
              <Text style={styles.footerLink}>Add Product</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerBottom}>
          <Text style={styles.footerBottomText}>
            © 2025 Msika Wanjala. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      {/* HAMBURGER MENU */}
      <Modal transparent visible={menuVisible} animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        />
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Menu</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// ----------------- STYLES -----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15 },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  logo: { width: 40, height: 40, marginRight: 8 },
  appName: { fontSize: 20, fontWeight: "bold", color: "#ff6f00" },
  headerActions: { flexDirection: "row", alignItems: "center" },
  signInButton: { backgroundColor: "#ff6f00", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginRight: 10 },
  signInText: { color: "#fff", fontWeight: "bold" },
  profileCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#ff6f00", justifyContent: "center", alignItems: "center", marginRight: 10 },
  initialsText: { color: "#fff", fontWeight: "bold" },
  profilePic: { width: 50, height: 50, borderRadius: 25 },
  hero: { padding: 20, alignItems: "center" },
  heroTitleTop: { fontSize: 26, fontWeight: "bold", color: "#000" },
  heroTitleBottom: { fontSize: 32, fontWeight: "bold", color: "#ff6f00", marginBottom: 10 },
  heroDesc: { fontSize: 15, color: "#555", textAlign: "center", marginBottom: 20 },
  primaryButton: { backgroundColor: "#ff6f00", padding: 12, borderRadius: 8, width: "80%", marginBottom: 10 },
  primaryButtonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  secondaryButton: { borderWidth: 1, borderColor: "#ff6f00", padding: 12, borderRadius: 8, width: "80%" },
  secondaryButtonText: { color: "#ff6f00", fontWeight: "bold", textAlign: "center" },
  section: { padding: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  linkText: { color: "#ff6f00", fontWeight: "bold" },
  productCard: { backgroundColor: "#f9f9f9", padding: 15, borderRadius: 12, marginBottom: 20 },
  productImage: { width: width - 40, height: 180, borderRadius: 10, marginBottom: 10 },
  productHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  productName: { fontSize: 18, fontWeight: "bold" },
  productPrice: { fontSize: 16, fontWeight: "bold", color: "#ff6f00", marginBottom: 5 },
  productDesc: { color: "#555", marginBottom: 5 },
  productMeta: { fontSize: 13, color: "#777", marginBottom: 10 },
  contactButton: { backgroundColor: "#ff6f00", padding: 10, borderRadius: 8 },
  contactButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  sellerCard: { backgroundColor: "#f9f9f9", padding: 15, borderRadius: 12, marginBottom: 20 },
  initialsCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#ddd", justifyContent: "center", alignItems: "center" },
  sellerName: { fontSize: 18, fontWeight: "bold" },
  sellerLocation: { fontSize: 13, color: "#555", marginLeft: 4 },
  sellerDetails: { marginTop: 10 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  detailText: { marginLeft: 5, fontSize: 14, color: "#555" },
  showProfileButton: { backgroundColor: "green", padding: 10, borderRadius: 8, marginTop: 10 },
  showProfileText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  dashboard: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", padding: 20 },
  statCard: { width: "48%", backgroundColor: "#f9f9f9", padding: 15, borderRadius: 12, marginBottom: 15, alignItems: "center" },
  statCount: { fontSize: 20, fontWeight: "bold", color: "#ff6f00", marginTop: 5 },
  statLabel: { fontSize: 14, color: "#555", marginTop: 2, textAlign: "center" },
  ctaPanel: { borderRadius: 15, padding: 20, margin: 20 },
  ctaTitle: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 10, textAlign: "center" },
  ctaDesc: { fontSize: 15, color: "#fff", marginBottom: 20, textAlign: "center" },
  ctaButton: { backgroundColor: "#fff", padding: 12, borderRadius: 8 },
  ctaButtonText: { color: "#ff6f00", fontWeight: "bold", textAlign: "center" },
  footerPanel: { backgroundColor: "#f2f2f2", padding: 20 },
  footerHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  footerLogo: { width: 40, height: 40, marginRight: 8 },
  footerAppName: { fontSize: 18, fontWeight: "bold", color: "#ff6f00" },
  footerDesc: { fontSize: 14, color: "#555", marginBottom: 20 },
  footerLinksRow: { flexDirection: "row", justifyContent: "space-between" },
  footerColumn: { flex: 1 },
  footerColumnTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5, color: "#333" },
  footerLink: { fontSize: 14, color: "#ff6f00", marginBottom: 5 },
  footerBottom: { padding: 15, backgroundColor: "#eee", alignItems: "center" },
  footerBottomText: { fontSize: 13, color: "#555" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  menuContainer: { position: "absolute", right: 0, top: 0, bottom: 0, width: "70%", backgroundColor: "#fff", padding: 20 },
  menuTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  menuItem: { paddingVertical: 12 },
  menuItemText: { fontSize: 16 },
});
