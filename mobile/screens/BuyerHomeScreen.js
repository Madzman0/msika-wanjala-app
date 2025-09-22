import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const productData = [
  { img: require("../assets/product1.jpg"), name: "Vegetables", price: 5000 },
  { img: require("../assets/product2.jpg"), name: "Crops", price: 8000 },
  { img: require("../assets/product3.jpg"), name: "Soyabeans", price: 10000 },
  { img: require("../assets/product4.jpg"), name: "Phones", price: 25000 },
  { img: require("../assets/product5.jpg"), name: "Crocs", price: 15000 },
  
];

export default function BuyerHomeScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [loggedIn, setLoggedIn] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);

  const user = { name: "Madzman Kapopo", profilePic: null };
  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const categories = ["Clothes", "Shoes", "Electronics", "Food", "Beauty"];
  const recentlyViewed = [0, 1, 2, 3];

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (currentSlide + 1) % productData.length;
      setCurrentSlide(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const handleBuy = (product) => {
    setCartCount(cartCount + 1);
    Alert.alert("Added to Cart", `${product.name} has been added to your cart.`);
  };

  const handleViewProduct = (product) => {
    Alert.alert("Product Details", `Viewing details for ${product.name}.`);
  };

  const handleCategoryPress = (category) => {
    Alert.alert("Category Selected", `You selected ${category}.`);
  };

  if (!loggedIn) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 18, color: "#333" }}>You are logged out.</Text>
        <TouchableOpacity style={styles.loginAgain} onPress={() => setLoggedIn(true)}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>Login Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require("../assets/logo.png")} style={styles.logo} />
          <Text style={styles.appName}>Msika Wanjala</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.profileRow}>
            <View style={styles.profileCircle}>
              {user.profilePic ? (
                <Image source={user.profilePic} style={styles.profilePic} />
              ) : (
                <Text style={styles.initialsText}>{initials}</Text>
              )}
            </View>
            <Text style={styles.userName}>{user.name.split(" ")[0]}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={28} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* CAROUSEL */}
        <View style={styles.carouselWrapper}>
          <TouchableOpacity
            style={styles.arrowLeft}
            onPress={() =>
              setCurrentSlide((prev) => (prev - 1 + productData.length) % productData.length)
            }
          >
            <Ionicons name="chevron-back-circle" size={36} color="#fff" />
          </TouchableOpacity>

          <ScrollView
            horizontal
            pagingEnabled
            ref={scrollRef}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false} // arrows control
          >
            {productData.map((p, i) => (
              <Image key={i} source={p.img} style={styles.carouselImage} />
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.arrowRight}
            onPress={() => setCurrentSlide((prev) => (prev + 1) % productData.length)}
          >
            <Ionicons name="chevron-forward-circle" size={36} color="#fff" />
          </TouchableOpacity>

          <View style={styles.carouselDots}>
            {productData.map((_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: currentSlide === i ? "#ff6f00" : "#ccc" }]} />
            ))}
          </View>
        </View>

        {/* CATEGORIES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat, i) => (
              <TouchableOpacity key={i} style={styles.categoryCard} onPress={() => handleCategoryPress(cat)}>
                <Ionicons name="pricetag" size={24} color="#ff6f00" />
                <Text style={styles.categoryText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* GRID PRODUCTS */}
        <View style={styles.gridContainer}>
          {productData.map((product, i) => (
            <View key={i} style={styles.gridCard}>
              <Image source={product.img} style={styles.gridImage} />
              {i % 2 === 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.badgeText}>Discount</Text>
                </View>
              )}
              {i % 3 === 0 && (
                <View style={[styles.newBadge, { top: 35 }]}>
                  <Text style={styles.badgeText}>New</Text>
                </View>
              )}
              <Text style={styles.gridTitle}>{product.name}</Text>
              <View style={styles.starRow}>
                {[...Array(5)].map((_, idx) => (
                  <Ionicons
                    key={idx}
                    name={idx < 4 ? "star" : "star-half"}
                    size={14}
                    color="#FFD700"
                  />
                ))}
                <Text style={{ marginLeft: 5, color: "gray", fontSize: 12 }}>50 sold</Text>
              </View>
              <Text style={styles.gridPrice}>MK {product.price}</Text>
              <View style={styles.gridButtons}>
                <TouchableOpacity style={styles.buyBtn} onPress={() => handleBuy(product)}>
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.buyBtn, { backgroundColor: "#333" }]}
                  onPress={() => handleViewProduct(product)}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* RECENTLY VIEWED */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Viewed</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentlyViewed.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.recentCard}
                onPress={() => handleViewProduct(productData[item % productData.length])}
              >
                <Image source={productData[item % productData.length].img} style={styles.recentImage} />
                <Text style={{ marginTop: 5, fontSize: 12 }}>
                  {productData[item % productData.length].name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* FLOATING CART */}
      <TouchableOpacity
        style={styles.floatingCart}
        onPress={() => Alert.alert("Cart", `You have ${cartCount} items in cart.`)}
      >
        <Ionicons name="cart" size={28} color="#fff" />
        {cartCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={{ color: "#fff", fontSize: 12 }}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* MENU */}
      <Modal transparent visible={menuVisible} animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)} />
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
            <Text style={[styles.menuItemText, { color: "#ff6f00", fontWeight: "bold" }]}>
              Switch to Seller
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => setLoggedIn(false)}>
            <Text style={[styles.menuItemText, { color: "red" }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loginAgain: { marginTop: 20, backgroundColor: "#ff6f00", padding: 10, borderRadius: 5 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, backgroundColor: "#f8f8f8" },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  logo: { width: 40, height: 40, marginRight: 10 },
  appName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  headerActions: { flexDirection: "row", alignItems: "center" },
  profileRow: { flexDirection: "row", alignItems: "center", marginRight: 15 },
  profileCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#ddd", justifyContent: "center", alignItems: "center", marginRight: 5 },
  profilePic: { width: "100%", height: "100%", borderRadius: 20 },
  initialsText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  userName: { fontSize: 16, color: "#333" },
  carouselWrapper: { width, height: 180, marginBottom: 15, justifyContent: "center" },
  carouselImage: { width, height: 180, resizeMode: "cover", borderRadius: 10 },
  arrowLeft: { position: "absolute", left: 10, top: 70, zIndex: 2 },
  arrowRight: { position: "absolute", right: 10, top: 70, zIndex: 2 },
  carouselDots: { position: "absolute", bottom: 10, width: "100%", flexDirection: "row", justifyContent: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 3 },
  section: { marginTop: 10, paddingHorizontal: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  categoryCard: { alignItems: "center", marginRight: 15 },
  categoryText: { marginTop: 5, fontSize: 14, color: "#333" },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 10 },
  gridCard: { width: "48%", backgroundColor: "#fff", marginBottom: 10, borderRadius: 10, padding: 10, elevation: 2 },
  gridImage: { width: "100%", height: 120, borderRadius: 10 },
  gridTitle: { marginTop: 8, fontWeight: "bold", fontSize: 14, color: "#333" },
  starRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  gridPrice: { marginTop: 5, fontWeight: "bold", fontSize: 14, color: "green" },
  gridButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  buyBtn: { flex: 1, backgroundColor: "#ff6f00", padding: 6, borderRadius: 5, justifyContent: "center", alignItems: "center", marginRight: 5 },
  discountBadge: { position: "absolute", top: 10, left: 10, backgroundColor: "red", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  newBadge: { position: "absolute", top: 10, left: 10, backgroundColor: "green", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  recentCard: { marginRight: 15, alignItems: "center" },
  recentImage: { width: 80, height: 80, borderRadius: 10 },
  floatingCart: { position: "absolute", bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: "#ff6f00", justifyContent: "center", alignItems: "center" },
  cartBadge: { position: "absolute", top: 5, right: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: "red", justifyContent: "center", alignItems: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  menuContainer: { backgroundColor: "#fff", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  menuTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  menuItem: { paddingVertical: 10 },
  menuItemText: { fontSize: 16, color: "#333" },
});
