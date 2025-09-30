import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  FlatList,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { CartContext } from "../context/CartContext";

const { width } = Dimensions.get("window");
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const productData = [
  { img: require("../assets/product1.jpg"), name: "Vegetables", price: 5000, category: "Food", supplier: "Green Farm Ltd", location: "Lilongwe" },
  { img: require("../assets/product2.jpg"), name: "Crops", price: 8000, category: "Food", supplier: "Harvest Co", location: "Blantyre" },
  { img: require("../assets/product3.jpg"), name: "Soyabeans", price: 10000, category: "Food", supplier: "Agri Export", location: "Mzuzu" },
  { img: require("../assets/product4.jpg"), name: "Phones", price: 25000, category: "Electronics", supplier: "Tech Hub", location: "Lilongwe" },
  { img: require("../assets/product5.jpg"), name: "Crocs", price: 15000, category: "Shoes", supplier: "Fashion Store", location: "Zomba" },
];

export default function BuyerHomeScreen({ navigation }) {
  const { cartItems, setCartItems } = useContext(CartContext);

  const [menuVisible, setMenuVisible] = useState(false);
  const [productVisible, setProductVisible] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [likes, setLikes] = useState(productData.map(() => 0));
  const [searchText, setSearchText] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("Home");
  const scrollRef = useRef(null);

  const user = { name: "Madzman Kapopo", profilePic: null };
  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase();
  const categories = ["All", "Clothes", "Shoes", "Electronics", "Food", "Beauty"];

  const [chats, setChats] = useState([
    { id: 1, name: "Green Farm Ltd", lastMessage: "Your vegetables arrived?", unread: 2 },
    { id: 2, name: "Harvest Co", lastMessage: "We have fresh crops available.", unread: 0 },
  ]);

  const [productList, setProductList] = useState(productData);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedProductForOptions, setSelectedProductForOptions] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (currentSlide + 1) % productData.length;
      setCurrentSlide(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const handleBuy = (product) => {
    const exists = cartItems.find((item) => item.name === product.name);
    if (exists) {
      setCartItems(cartItems.map((item) =>
        item.name === product.name ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, qty: 1 }]);
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setProductModalVisible(true);
  };

  const closeProductModal = () => {
    setProductModalVisible(false);
    setSelectedProduct(null);
  };

  const handleLike = (index) => {
    const updated = [...likes];
    updated[index] += 1;
    setLikes(updated);
  };

  const handleOptionsPress = (product) => {
    setSelectedProductForOptions(product);
    setOptionsModalVisible(true);
  };

  const closeOptionsModal = () => {
    setOptionsModalVisible(false);
    setSelectedProductForOptions(null);
  };

  const filteredProducts = productList.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesLocation = p.location.toLowerCase().includes(searchLocation.toLowerCase());
    return matchesCategory && matchesSearch && matchesLocation;
  });

  const handleCategoryPress = (category) => {
    setActiveCategory(category);
    if (category === "All") {
      setProductList(productData);
    } else {
      setProductList(productData.filter((p) => p.category === category));
    }
  };

  const handleLoadMore = () => {
    if (activeCategory === "All") {
      setProductList((prevList) => [...prevList, ...productData]);
    }
  };

  const renderProduct = ({ item, index }) => {
    const inCart = cartItems.some((cartItem) => cartItem.name === item.name);
    return (
      <View style={styles.masonryCard}>
        <Image source={item.img} style={styles.masonryImage} />
        {inCart && (
          <View style={styles.addedTag}>
            <Text style={{ color: "green", fontWeight: "bold" }}>Added to cart</Text>
          </View>
        )}
        <View style={styles.bottomButtons}>
          <TouchableOpacity onPress={() => handleBuy(item)}>
            <Text style={styles.overlayBtn}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleViewProduct(item)}>
            <Text style={styles.overlayBtn}>View</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardFooterOverlay}>
          <Text style={styles.gridTitle}>{item.name}</Text>
          <View style={styles.footerRight}>
            <TouchableOpacity style={styles.heartRow} onPress={() => handleLike(index)}>
              <Ionicons name="heart" size={16} color="red" />
              <Text style={{ marginLeft: 3, fontSize: 12 }}>{likes[index]}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleOptionsPress(item)}>
              <Ionicons name="ellipsis-vertical" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const handleChatPress = (chatId) => {
    setChats(chats.map(chat =>
      chat.id === chatId ? { ...chat, unread: 0 } : chat
    ));
    const chat = chats.find(c => c.id === chatId);
    navigation.navigate("ChatScreen", { chatId: chat.id, chatName: chat.name });
  };

  const tabs = [
    { name: "Home", icon: <Ionicons name="home" size={24} /> },
    { name: "Messenger", icon: <Ionicons name="chatbubbles" size={24} /> },
    { name: "History", icon: <MaterialIcons name="history" size={24} /> },
    { name: "Profile", icon: <FontAwesome5 name="user-alt" size={20} /> },
    { name: "Notifications", icon: <Ionicons name="notifications" size={24} /> },
  ];

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require("../assets/logo.png")} style={styles.logo} />
          <Text style={styles.appName}>Msika Wanjala</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity>
            <View style={styles.profileCircle}>
              {user.profilePic ? (
                <Image source={user.profilePic} style={styles.profilePic} />
              ) : (
                <Text style={styles.initialsText}>{initials}</Text>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={28} color="#333" />
          </TouchableOpacity>
          {menuVisible && (
            <Modal
              transparent={true}
              animationType="fade"
              visible={menuVisible}
              onRequestClose={() => setMenuVisible(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                onPress={() => setMenuVisible(false)}
              >
                <View style={styles.hamburgerMenu}>
                  <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("VendorProfile")}>
                    <Text style={styles.menuItemText}>Switch to vendor profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("RateApp")}>
                    <Text style={styles.menuItemText}>Rate this app</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Logout")}>
                    <Text style={styles.menuItemText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>
          )}
        </View>
      </View>

      {/* MAIN CONTENT */}
      <View style={{ flex: 1 }}>
        {activeTab === "Home" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Search */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#777" style={{ marginHorizontal: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {/* Search by Location */}
            <View style={[styles.searchBar, { marginTop: 5 }]}>
              <Ionicons name="location" size={20} color="#777" style={{ marginHorizontal: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by location..."
                value={searchLocation}
                onChangeText={setSearchLocation}
              />
            </View>

            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabs}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryTab, activeCategory === cat && styles.activeTab]}
                  onPress={() => handleCategoryPress(cat)}
                >
                  <Text style={[styles.categoryTabText, activeCategory === cat && styles.activeTabText]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Carousel */}
            <View style={[styles.carouselWrapper, { width: screenWidth, height: screenWidth * 0.4 }]}>
              <ScrollView
                horizontal
                pagingEnabled
                ref={scrollRef}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
              >
                {productData.map((p, i) => (
                  <View key={i} style={{ width: screenWidth, height: screenWidth * 0.4 }}>
                    <Image source={p.img} style={styles.carouselImage} />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Product Grid */}
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(_, index) => index.toString()}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 8 }}
              contentContainerStyle={{ paddingHorizontal: 10 }}
              onEndReached={activeCategory === "All" ? handleLoadMore : null}
              onEndReachedThreshold={0.5}
            />
          </ScrollView>
        )}

        {/* Messenger */}
        {activeTab === "Messenger" && (
          <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 100 }}>
            {chats.length === 0 ? (
              <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>No chats</Text>
            ) : (
              chats.map((chat) => (
                <TouchableOpacity
                  key={chat.id}
                  style={styles.chatCard}
                  onPress={() => handleChatPress(chat.id)}
                >
                  <View style={styles.chatAvatar}>
                    <Text style={{ fontWeight: "bold", color: "#333" }}>
                      {chat.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>{chat.name}</Text>
                    <Text style={{ color: "#555" }} numberOfLines={1}>{chat.lastMessage}</Text>
                  </View>
                  {chat.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={{ color: "#fff", fontSize: 12 }}>{chat.unread}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}

        {/* History */}
        {activeTab === "History" && (
          <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 100 }}>
            {cartItems.length === 0 ? (
              <Text style={{ textAlign: "center", marginTop: 20 }}>No purchase history yet.</Text>
            ) : (
              cartItems.map((item, i) => (
                <View key={i} style={styles.historyCard}>
                  <Text style={styles.historyTitle}>{item.name}</Text>
                  <View style={styles.historyRow}>
                    <Text style={styles.historyLabel}>Quantity:</Text>
                    <Text style={styles.historyValue}>{item.qty}</Text>
                  </View>
                  <View style={styles.historyRow}>
                    <Text style={styles.historyLabel}>Price:</Text>
                    <Text style={styles.historyValue}>{item.price}</Text>
                  </View>
                  <View style={styles.historyRow}>
                    <Text style={styles.historyLabel}>Supplier:</Text>
                    <Text style={styles.historyValue}>{item.supplier}</Text>
                  </View>
                  <View style={styles.historyRow}>
                    <Text style={styles.historyLabel}>Location:</Text>
                    <Text style={styles.historyValue}>{item.location}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* Profile */}
        {activeTab === "Profile" && (
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.profileBigCircle}>
                <Text style={{ fontWeight: "bold", fontSize: 28 }}>{initials}</Text>
              </View>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileSubtitle}>Buyer Account</Text>
              <TouchableOpacity style={styles.uploadBtn}>
                <Ionicons name="camera" size={18} color="#fff" />
                <Text style={styles.uploadBtnText}>Upload Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Your Member ID</Text>
              <Text style={styles.infoValue}>mw29039724905exgu</Text>

              <Text style={styles.infoLabel}>Email</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.infoValue}>mad***@gmail.com</Text>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Change</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.infoLabel}>Linked Mobile</Text>
              <TouchableOpacity>
                <Text style={styles.linkText}>Enter Mobile Number</Text>
              </TouchableOpacity>
            </View>

            {/* Hybrid Panels */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              {["My Profile","Member Profile","Privacy Settings","Email Preferences","Tax Information","Data Preferences"].map((label,i)=>(
                <TouchableOpacity key={i} style={styles.profileOption}>
                  <Text style={styles.profileOptionText}>{label}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#777" />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Security</Text>
              {["Change Email Address","Change Password","Manage Verification Phones","Manage My Connected Accounts"].map((label,i)=>(
                <TouchableOpacity key={i} style={styles.profileOption}>
                  <Text style={styles.profileOptionText}>{label}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#777" />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Finance Account</Text>
              <TouchableOpacity style={styles.profileOption}>
                <Text style={styles.profileOptionText}>My Transactions</Text>
                <Ionicons name="chevron-forward" size={18} color="#777" />
              </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity style={[styles.profileOption,{marginTop:20,borderTopWidth:1,borderColor:"#eee"}]}>
              <Ionicons name="log-out-outline" size={20} color="red" />
              <Text style={[styles.profileOptionText,{color:"red",marginLeft:10}]}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Notifications */}
        {activeTab === "Notifications" && (
          <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 100 }}>
            <Text style={{ textAlign: "center", color: "#777", marginTop: 20 }}>No notifications</Text>
          </ScrollView>
        )}
      </View>

      {/* Product Modal */}
      {selectedProduct && (
        <Modal
          visible={productModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeProductModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Image source={selectedProduct.img} style={styles.modalImage} />
              <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
              <Text style={styles.modalText}>Price: {selectedProduct.price}</Text>
              <Text style={styles.modalText}>Category: {selectedProduct.category}</Text>
              <Text style={styles.modalText}>Supplier: {selectedProduct.supplier}</Text>
              <Text style={styles.modalText}>Location: {selectedProduct.location}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeProductModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Options Modal */}
      {selectedProductForOptions && (
        <Modal
          visible={optionsModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeOptionsModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.optionsModalContent}>
              <Text style={styles.modalTitle}>Options</Text>
              <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate("ChatScreen", { supplier: selectedProductForOptions.supplier })}>
                <Text style={styles.optionButtonText}>Contact Supplier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={closeOptionsModal}>
                <Text style={styles.optionButtonText}>Not Interested</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate("RelatedProducts", { category: selectedProductForOptions.category })}>
                <Text style={styles.optionButtonText}>See Related Products</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={closeOptionsModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Floating Cart */}
      <TouchableOpacity style={styles.floatingCart} onPress={() => navigation.navigate("Cart")}>
        <Ionicons name="cart" size={28} color="#fff" />
        {cartItems.length > 0 && (
          <View style={styles.cartBadge}>
            <Text style={{ color: "#fff", fontSize: 12 }}>{cartItems.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButton}
            onPress={() => setActiveTab(tab.name)}
          >
            <View style={{ alignItems: "center" }}>
              {React.cloneElement(tab.icon, { color: activeTab === tab.name ? "#ff6f00" : "#777" })}
              <Text style={{ color: activeTab === tab.name ? "#ff6f00" : "#777", fontSize: 12, marginTop: 2 }}>
                {tab.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 15, paddingVertical: 10, backgroundColor: "#f8f8f8" },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  logo: { width: 40, height: 40, marginRight: 10 },
  appName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  headerActions: { flexDirection: "row", alignItems: "center" },
  profileRow: { flexDirection: "row", alignItems: "center", marginRight: 15 },
  profileCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#ddd", justifyContent: "center", alignItems: "center", marginRight: 10 },
  initialsText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, backgroundColor: "#f8f8f8" },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  logo: { width: 40, height: 40, marginRight: 10 },
  appName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  headerActions: { flexDirection: "row", alignItems: "center" },
  profileRow: { flexDirection: "row", alignItems: "center", marginRight: 15 },
  profileCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#ddd", justifyContent: "center", alignItems: "center", marginRight: 5 },
  profileBigCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#ddd", justifyContent: "center", alignItems: "center", marginRight: 15 },
  initialsText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  userName: { fontSize: 16, color: "#333" },
  
  // --- Profile Tab Styles ---
  profileHeader: { alignItems: "center", marginBottom: 20 },
  profileName: { fontSize: 20, fontWeight: "bold", color: "#333", marginTop: 10 },
  profileSubtitle: { color: "#777", marginTop: 2 },
  uploadBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#ff6f00", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 10 },
  uploadBtnText: { color: "#fff", marginLeft: 5, fontSize: 12, fontWeight: "bold" },
  infoCard: { backgroundColor: "#f9f9f9", padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2 },
  infoLabel: { fontSize: 14, color: "#555", marginTop: 10, fontWeight: "bold" },
  infoValue: { fontSize: 14, color: "#333", marginTop: 4 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  linkText: { color: "#ff6f00", fontWeight: "bold" },
  section: { marginBottom: 20, backgroundColor: "#fff", borderRadius: 12, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", padding: 12, color: "#333", borderBottomWidth: 1, borderColor: "#eee" },
  profileOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, borderBottomWidth: 1, borderColor: "#f1f1f1" },
  profileOptionText: { fontSize: 15, color: "#333" },

  // --- Search & Categories ---
  searchBar: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#f1f1f1", 
    margin: 10, 
    borderRadius: 8, 
    paddingHorizontal: 10 
  },
  searchInput: { 
    flex: 1, 
    paddingVertical: 8, 
    fontSize: 14 
  },
  categoryTabs: { paddingHorizontal: 10, marginBottom: 10 },
  categoryTab: { paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20, backgroundColor: "#eee", marginRight: 10 },
  activeTab: { backgroundColor: "#ff6f00" },
  categoryTabText: { fontSize: 14, color: "#333" },
  activeTabText: { color: "#fff", fontWeight: "bold" },

  // --- Carousel ---
  carouselWrapper: { marginBottom: 15 },
  carouselImage: { width: "100%", height: "100%", resizeMode: "cover", borderRadius: 10 },

  // --- Products ---
  masonryCard: { width: "48%", backgroundColor: "#fff", borderRadius: 10, elevation: 3, overflow: "hidden" },
  masonryImage: { width: "100%", height: 200, borderRadius: 10, resizeMode: "cover" },
  addedTag: { position: "absolute", top: 10, left: 10, borderWidth: 1, borderColor: "green", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, backgroundColor: "#eaffea" },
  bottomButtons: { position: "absolute", bottom: 30, left: 5, flexDirection: "row" },
  overlayBtn: { color: "#fff", fontWeight: "bold", marginLeft: 5, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  cardFooterOverlay: { position: "absolute", bottom: 0, width: "100%", backgroundColor: "rgba(0,0,0,0.4)", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 5, paddingVertical: 3 },
  footerRight: { flexDirection: "row", alignItems: "center" },
  heartRow: { flexDirection: "row", alignItems: "center", marginRight: 8 },
  gridTitle: { fontWeight: "bold", fontSize: 14, color: "#fff" },

  // --- Floating Cart & Bottom Tabs ---
  floatingCart: { position: "absolute", bottom: 70, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: "#ff6f00", justifyContent: "center", alignItems: "center" },
  cartBadge: { position: "absolute", top: 5, right: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: "red", justifyContent: "center", alignItems: "center" },
  bottomTabBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 60, flexDirection: "row", borderTopWidth: 1, borderTopColor: "#ddd", backgroundColor: "#fff" },
  tabButton: { flex: 1, justifyContent: "center", alignItems: "center" },

  // --- Messenger ---
  chatCard: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "#f9f9f9", marginBottom: 8, borderRadius: 8 },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#ddd", justifyContent: "center", alignItems: "center", marginRight: 10 },
  unreadBadge: { backgroundColor: "red", borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },

  // --- History Tab Styles ---
  historyCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  historyLabel: {
    fontSize: 14,
    color: "#555",
    fontWeight: "bold",
  },
  historyValue: {
    fontSize: 14,
    color: "#333",
  },

  // --- Profile Buttons ---
  profileBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
  profileBtnText: { marginLeft: 10, fontSize: 16, color: "#333" },

  // --- Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#ff6f00",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  optionsModalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  optionButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  optionButtonText: {
    fontSize: 16,
    color: "#333",
  },
  hamburgerMenu: {
    position: "absolute",
    top: 50,
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    padding: 10,
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
});
