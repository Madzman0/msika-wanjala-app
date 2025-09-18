import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
    images: [
      require("../assets/maize.png"),
      require("../assets/maize.png"),
      require("../assets/maize.png"),
    ],
  },
  {
    id: "2",
    name: "Cement Bags",
    desc: "Quality construction material",
    type: "Construction",
    seller: "BuildPro",
    location: "Blantyre",
    price: "MWK 12,000",
    images: [
      require("../assets/cement.png"),
      require("../assets/cement.png"),
    ],
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
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? darkStyles : lightStyles;

  return (
    <ScrollView style={theme.container}>
      {/* HEADER */}
      <View style={theme.header}>
        <View style={theme.logoContainer}>
          <Image source={require("../assets/logo.png")} style={theme.logo} />
          <Text style={theme.appName}>Msika Wanjala</Text>
        </View>
        <View style={theme.headerActions}>
          <TouchableOpacity
            style={theme.signInButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={theme.signInText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons
              name="menu"
              size={28}
              color={darkMode ? "#fff" : "#333"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* HERO SECTION */}
      <View style={theme.hero}>
        <Text style={theme.heroTitleTop}>Your Local</Text>
        <Text style={theme.heroTitleBottom}>Marketplace</Text>
        <Text style={theme.heroDesc}>
          Connect with local sellers and discover quality products in your
          community. From fresh farm produce to construction materials - find
          everything you need.
        </Text>

        <TouchableOpacity style={theme.primaryButton}>
          <Text style={theme.primaryButtonText}>Start Shopping</Text>
        </TouchableOpacity>

        <TouchableOpacity style={theme.secondaryButton}>
          <Text style={theme.secondaryButtonText}>Become a Seller</Text>
        </TouchableOpacity>
      </View>

      {/* FEATURED PRODUCTS */}
      <View style={theme.section}>
        <View style={theme.sectionHeader}>
          <Text style={theme.sectionTitle}>Featured Products</Text>
          <TouchableOpacity>
            <Text style={theme.linkText}>View all</Text>
          </TouchableOpacity>
        </View>

        {featuredProducts.map((product) => (
          <View key={product.id} style={theme.productCard}>
            {/* Image carousel */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 10 }}
            >
              {product.images.map((img, idx) => (
                <Image
                  key={idx}
                  source={img}
                  style={theme.productImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {/* Product Header */}
            <View style={theme.productHeader}>
              <Text style={theme.productName}>{product.name}</Text>
              <Ionicons name="heart-outline" size={26} color="#ff6f00" />
            </View>
            <Text style={theme.productPrice}>{product.price}</Text>
            <Text style={theme.productDesc}>{product.desc}</Text>
            <Text style={theme.productMeta}>
              {product.type} • {product.seller} | {product.location}
            </Text>

            <TouchableOpacity style={theme.contactButton}>
              <Text style={theme.contactButtonText}>Contact Seller</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* TOP SELLERS */}
      <View style={theme.section}>
        <View style={theme.sectionHeader}>
          <Text style={theme.sectionTitle}>Top Sellers</Text>
          <TouchableOpacity>
            <Text style={theme.linkText}>View all sellers</Text>
          </TouchableOpacity>
        </View>

        {topSellers.map((seller) => (
          <View key={seller.id} style={theme.sellerCard}>
            {/* Profile + name */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {seller.profilePic ? (
                <Image source={seller.profilePic} style={theme.profilePic} />
              ) : (
                <View style={theme.initialsCircle}>
                  <Text style={theme.initialsText}>
                    {seller.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={{ marginLeft: 10 }}>
                <Text style={theme.sellerName}>{seller.name}</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="location"
                    size={14}
                    color={darkMode ? "#aaa" : "#555"}
                  />
                  <Text style={theme.sellerLocation}>{seller.location}</Text>
                </View>
              </View>
            </View>

            {/* Details */}
            <View style={theme.sellerDetails}>
              <View style={theme.detailRow}>
                <Ionicons name="call" size={16} color="#ff6f00" />
                <Text style={theme.detailText}>{seller.phone}</Text>
              </View>
              <View style={theme.detailRow}>
                <Ionicons name="cube" size={16} color="#ff6f00" />
                <Text style={theme.detailText}>
                  {seller.products} products
                </Text>
              </View>
              <View style={theme.detailRow}>
                <Ionicons name="star" size={16} color="#ff6f00" />
                <Text style={theme.detailText}>{seller.rating} rating</Text>
              </View>
            </View>

            {/* Show Profile Button */}
            <TouchableOpacity style={theme.showProfileButton}>
              <Text style={theme.showProfileText}>Show Profile</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* DASHBOARD STATS */}
      <View style={theme.dashboard}>
        {dashboardStats.map((stat) => (
          <View key={stat.id} style={theme.statCard}>
            <Ionicons name={stat.icon} size={28} color="#ff6f00" />
            <Text style={theme.statCount}>{stat.count}</Text>
            <Text style={theme.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* CALL TO ACTION PANEL */}
      <LinearGradient
        colors={["#4caf50", "#ff9800"]}
        style={theme.ctaPanel}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={theme.ctaTitle}>Ready to start selling?</Text>
        <Text style={theme.ctaDesc}>
          Join our growing community of sellers and reach customers across
          Malawi. List your products today and grow your business.
        </Text>
        <TouchableOpacity style={theme.ctaButton}>
          <Text style={theme.ctaButtonText}>Register as a Seller</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* FOOTER PANEL */}
      <View style={theme.footerPanel}>
        <View style={theme.footerHeader}>
          <Image source={require("../assets/logo.png")} style={theme.footerLogo} />
          <Text style={theme.footerAppName}>Msika Wanjala</Text>
        </View>
        <Text style={theme.footerDesc}>
          Connecting local buyers and sellers across Malawi. Building stronger
          communities through trade.
        </Text>

        <View style={theme.footerLinksRow}>
          <View style={theme.footerColumn}>
            <Text style={theme.footerColumnTitle}>Quick Links</Text>
            <Text style={theme.footerLink}>Browse Products</Text>
            <Text style={theme.footerLink}>Find Sellers</Text>
          </View>
          <View style={theme.footerColumn}>
            <Text style={theme.footerColumnTitle}>For Sellers</Text>
            <Text style={theme.footerLink}>Start Selling</Text>
            <Text style={theme.footerLink}>Add Product</Text>
          </View>
        </View>
      </View>

      {/* BOTTOM FOOTER */}
      <View style={theme.footerBottom}>
        <Text style={theme.footerBottomText}>
          © 2025 Msika Wanjala. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

// LIGHT THEME
const lightStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15 },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  logo: { width: 40, height: 40, resizeMode: "contain", marginRight: 8 },
  appName: { fontSize: 20, fontWeight: "bold", color: "#ff6f00" },
  headerActions: { flexDirection: "row", alignItems: "center" },
  signInButton: { backgroundColor: "#ff6f00", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginRight: 10 },
  signInText: { color: "#fff", fontWeight: "bold" },

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
  productImage: { width: 300, height: 200, borderRadius: 10, marginRight: 10 },
  productHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  productName: { fontSize: 18, fontWeight: "bold" },
  productPrice: { fontSize: 16, fontWeight: "bold", color: "#ff6f00", marginBottom: 5 },
  productDesc: { color: "#555", marginBottom: 5 },
  productMeta: { fontSize: 13, color: "#777", marginBottom: 10 },
  contactButton: { backgroundColor: "#ff6f00", padding: 10, borderRadius: 8 },
  contactButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },

  sellerCard: { backgroundColor: "#f9f9f9", padding: 15, borderRadius: 12, marginBottom: 20 },
  profilePic: { width: 50, height: 50, borderRadius: 25 },
  initialsCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#ddd", justifyContent: "center", alignItems: "center" },
  initialsText: { fontSize: 18, fontWeight: "bold", color: "#555" },
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
});

// DARK THEME
const darkStyles = StyleSheet.create({
  ...lightStyles,
  container: { flex: 1, backgroundColor: "#121212" },
  productCard: { backgroundColor: "#1e1e1e" },
  sellerCard: { backgroundColor: "#1e1e1e" },
  statCard: { backgroundColor: "#1e1e1e" },
  footerPanel: { backgroundColor: "#1e1e1e" },
  footerColumnTitle: { color: "#fff" },
  footerLink: { color: "#ff9800" },
  footerBottom: { backgroundColor: "#000" },
  footerBottomText: { color: "#aaa" },
  footerDesc: { color: "#aaa" },
});
