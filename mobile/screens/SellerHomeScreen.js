// screens/SellerHomeScreen.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LineChart, PieChart, BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function SellerHomeScreen({ navigation, setIsLoggedIn }) {
  // Tabs: Dashboard, Post, Messages, History, Notifications
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Topbar / role & menu
  const [menuVisible, setMenuVisible] = useState(false);
  const [shopName, setShopName] = useState("My Shop");

  // Slide animation (menu slides in from right)
  const menuAnim = useRef(new Animated.Value(300)).current;

  // Product list (sample data)
  const [products, setProducts] = useState([
    {
      id: "p1",
      name: "Vegetables",
      category: "Food",
      price: 5000,
      seller: "Green Farm Ltd",
      imageUrl: null,
      description: "Fresh vegetables",
      likes: 12,
      sales: 40,
      locationCounts: { Lilongwe: 10, Blantyre: 8, Mzuzu: 5 },
      postedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      expiresInDays: 10,
      reliableVotes: 18,
      rating: 4.5,
    },
    {
      id: "p2",
      name: "Phones",
      category: "Electronics",
      price: 25000,
      seller: "Tech Hub",
      imageUrl: null,
      description: "Smartphone",
      likes: 32,
      sales: 70,
      locationCounts: { Lilongwe: 20, Zomba: 10, Mzuzu: 8 },
      postedAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
      expiresInDays: 30,
      reliableVotes: 45,
      rating: 4.8,
    },
    {
      id: "p3",
      name: "Crocs",
      category: "Shoes",
      price: 15000,
      seller: "Fashion Store",
      imageUrl: null,
      description: "Comfort shoes",
      likes: 8,
      sales: 18,
      locationCounts: { Zomba: 8, Blantyre: 6 },
      postedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
      expiresInDays: 14,
      reliableVotes: 9,
      rating: 4.0,
    },
  ]);

  // Post form fields
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("14");

  // Notifications & messages & history
  const [notifications, setNotifications] = useState([
    { id: "n1", text: "Welcome — your seller dashboard is ready", time: Date.now(), read: false },
  ]);
  const [messages, setMessages] = useState([
    { id: "m1", from: "Green Farm Ltd", text: "Do you have bulk discount?", time: Date.now() - 3600 * 1000 * 5, unread: true },
  ]);
  const [salesHistory, setSalesHistory] = useState([
    { id: "s1", productId: "p2", buyer: "John M", amount: 25000, status: "Paid", time: Date.now() - 3600 * 1000 * 24 * 2 },
  ]);

  // Derived data for charts
  const computePieData = () => {
    const total = products.reduce((sum, p) => sum + p.likes, 0) || 1;
    return products.map((p, i) => ({
      name: p.name,
      population: p.likes,
      color: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff"][i % 5],
      legendFontColor: "#333",
      legendFontSize: 12,
    }));
  };

  const computeBuyerLocations = () => {
    const agg = {};
    products.forEach((p) => {
      if (p.locationCounts) {
        Object.keys(p.locationCounts).forEach((loc) => {
          agg[loc] = (agg[loc] || 0) + p.locationCounts[loc];
        });
      }
    });
    const labels = Object.keys(agg);
    const data = labels.map((l) => agg[l]);
    if (labels.length === 0) {
      return { labels: ["Local"], datasets: [{ data: [1] }] };
    }
    return { labels, datasets: [{ data }] };
  };

  const computeSalesSeries = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const totals = [0, 0, 0, 0, 0, 0];
    products.forEach((p, idx) => {
      totals.forEach((_, i) => {
        totals[i] += Math.max(0, Math.round((p.sales || 0) * (0.5 + ((i + idx) % 6) / 6)));
      });
    });
    return { labels: months, datasets: [{ data: totals }] };
  };

  const topSellers = () => {
    const sellerAgg = {};
    products.forEach((p) => {
      sellerAgg[p.seller] = (sellerAgg[p.seller] || 0) + (p.sales || 0);
    });
    return Object.entries(sellerAgg)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  };

  const ratingSummary = () => {
    const totalRatings = products.reduce((s, p) => s + (p.rating || 0), 0);
    const avgRating = products.length ? +(totalRatings / products.length).toFixed(2) : 0;
    const reliableVotes = products.reduce((s, p) => s + (p.reliableVotes || 0), 0);
    return { avgRating, reliableVotes };
  };

  const remainingDays = (p) => {
    const posted = p.postedAt || Date.now();
    const expiry = (p.expiresInDays || 14) * 24 * 3600 * 1000;
    const remainingMs = posted + expiry - Date.now();
    const days = Math.ceil(remainingMs / (24 * 3600 * 1000));
    return days > 0 ? days : 0;
  };

  // Menu open/close helpers
  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(menuAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start();
  };

  const closeMenu = () => {
    Animated.timing(menuAnim, { toValue: 300, duration: 200, useNativeDriver: true }).start(() => {
      setMenuVisible(false);
    });
  };

  const toggleMenu = () => {
    if (menuVisible) closeMenu();
    else openMenu();
  };

  const handleSwitchRole = (newRole) => {
    closeMenu();
    if (newRole === "Buyer" && typeof setIsLoggedIn === "function") {
      setIsLoggedIn(true);
    } else if (newRole === "Transporter") {
      navigation.replace("TransporterHome");
    }
  };

  const addProduct = () => {
    const id = `p${Date.now()}`;
    const newP = {
      id,
      name: productName || "Untitled",
      category,
      price: Number(price) || 0,
      seller: shopName,
      imageUrl: imageUrl || null,
      description,
      likes: 0,
      sales: 0,
      locationCounts: {},
      postedAt: Date.now(),
      expiresInDays: Number(expiresInDays) || 14,
      reliableVotes: 0,
      rating: 0,
    };
    setProducts((prev) => [newP, ...prev]);
    setNotifications((prev) => [
      { id: `n${Date.now()}`, text: `You posted: "${newP.name}"`, time: Date.now(), read: false },
      ...prev,
    ]);
    // clear form
    setProductName(""); setCategory("Electronics"); setPrice(""); setImageUrl(""); setDescription(""); setExpiresInDays("14");
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  // --- VIEWS ---

  const DashboardView = () => {
    const pie = computePieData();
    const buyerLocations = computeBuyerLocations();
    const salesSeries = computeSalesSeries();
    const top = topSellers();
    const rating = ratingSummary();

    return (
      <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.header}>Dashboard</Text>

        <View style={{ paddingHorizontal: 16 }}>
  {/* Pie Chart Panel */}
  <View style={[styles.panel, { marginBottom: 12 }]}>
    <Text style={styles.panelTitle}>Most Viewed Products</Text>
    {pie.length ? (
      <>
        <PieChart
          data={pie}
          width={screenWidth - 32} // full width minus padding
          height={180}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
          absolute
        />

        {/* Products list inside its own subtle box */}
        <View style={{
          backgroundColor: "#f7f7f7", // slightly darker white
          borderRadius: 10,
          padding: 10,
          marginTop: 8,
          maxHeight: 120,
        }}>
          <ScrollView>
            {products.map((p) => (
              <View key={p.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <View style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: pie.find(x => x.name === p.name)?.color || "#ccc",
                  marginRight: 6
                }} />
                <Text style={{ fontSize: 12, color: "#555" }}>{p.name}: {p.likes} likes</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </>
    ) : <Text style={{ color: "#777", textAlign: "center" }}>No data</Text>}
  </View>

  {/* Ratings & Reliability Panel */}
  <View style={[styles.panel, { marginBottom: 12 }]}>
    <Text style={styles.panelTitle}>Ratings & Reliability</Text>
    <Text style={styles.bigStat}>{rating.avgRating} ★</Text>
    <Text style={styles.smallNote}>{rating.reliableVotes} people marked you reliable</Text>

    {/* Top Sellers section inside its own box */}
    <View style={{ height: 12 }} />
    <Text style={styles.panelTitle}>Top Sellers</Text>
    <View style={{
      backgroundColor: "#f7f7f7", // slightly darker white
      borderRadius: 10,
      padding: 10,
      marginTop: 6,
    }}>
      {top.length ? top.map((s) => (
        <View key={s.name} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
          <Text style={{ fontWeight: "600", color: "#1f2937" }}>{s.name}</Text>
          <Text style={{ color: "#555" }}>{s.sales} sales</Text>
        </View>
      )) : <Text style={{ color: "#777", textAlign: "center" }}>No sellers yet</Text>}
    </View>
  </View>

  {/* Other panels continue vertically below */}
</View>


       {/* Top Buyers Locations Panel */}
<View style={[styles.panel, { marginBottom: 12 }]}>
  <Text style={styles.panelTitle}>Top Buyers Locations</Text>
  <BarChart
    data={buyerLocations}
    width={screenWidth - 40}
    height={180}
    chartConfig={{
      backgroundColor: "#fff",
      backgroundGradientFrom: "#fff",
      backgroundGradientTo: "#fff",
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(0,111,255,${opacity})`,
      labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    }}
    verticalLabelRotation={30}
  />
</View>

{/* Sales Panel */}
<View style={[styles.panel, { marginBottom: 12 }]}>
  <Text style={styles.panelTitle}>Sales (Recent Months)</Text>
  <LineChart
    data={salesSeries}
    width={screenWidth - 40}
    height={180}
    chartConfig={{
      backgroundColor: "#fff",
      backgroundGradientFrom: "#fff",
      backgroundGradientTo: "#fff",
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(255,111,0,${opacity})`,
      labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
      propsForDots: { r: "4", strokeWidth: "2", stroke: "#ffa500" },
    }}
  />
</View>

{/* Listings Expiry Panel */}
<View style={[styles.panel, { marginBottom: 12 }]}>
  <Text style={styles.panelTitle}>Listings Expiry</Text>

  {/* Wrap listings in a subtle box */}
  <View style={{
    backgroundColor: "#f7f7f7", // slightly darker white
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  }}>
    {products.map((p) => (
      <View key={p.id} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
        <View>
          <Text style={{ fontWeight: "600", color: "#1f2937" }}>{p.name}</Text>
          <Text style={{ color: "#555", fontSize: 12 }}>{p.category} • {p.seller}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontWeight: "700", color: "#1f2937" }}>
            {Math.min(remainingDays(p), 3)}d
          </Text>
          <Text style={{ color: "#555", fontSize: 12 }}>left</Text>
        </View>
      </View>
    ))}
  </View>
</View>


      </ScrollView>
    );
  };

  const [showCategoryModal, setShowCategoryModal] = useState(false); // already in your states
  const [categoryY, setCategoryY] = useState(0);
  const [categoryHeight, setCategoryHeight] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = shown
  
  const openCategoryModal = () => {
    setShowCategoryModal(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  const closeCategoryModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start(() => setShowCategoryModal(false));
  };
  
  const PostView = () => (
    <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 120 }}>
      <Text style={styles.header}>Post New Product</Text>
  
      <TextInput
        style={styles.input}
        placeholder="Product name*"
        placeholderTextColor="#888"
        value={productName}
        onChangeText={setProductName}
      />
  
      {/* Category Selector */}
      <TouchableOpacity
        style={[styles.input, { justifyContent: "center" }]}
        onPress={openCategoryModal}
        onLayout={(e) => {
          const { y, height } = e.nativeEvent.layout;
          setCategoryY(y);
          setCategoryHeight(height);
        }}
      >
        <Text style={{ color: category ? "#111" : "#888" }}>
          {category || "Select Category"}
        </Text>
      </TouchableOpacity>
  
      <TextInput
        style={styles.input}
        placeholder="Price"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />
      <TextInput
        style={styles.input}
        placeholder="Image URL (optional)"
        placeholderTextColor="#888"
        value={imageUrl}
        onChangeText={setImageUrl}
      />
      <TextInput
        style={[styles.input, { height: 120 }]}
        placeholder="Description"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Expires in (days)"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={expiresInDays}
        onChangeText={setExpiresInDays}
      />
  
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, { backgroundColor: "#ff6f00" }]} onPress={addProduct}>
          <Text style={styles.buttonText}>Add Product</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#777" }]}
          onPress={() => {
            setProductName("");
            setCategory("Electronics");
            setPrice("");
            setImageUrl("");
            setDescription("");
            setExpiresInDays("14");
          }}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
  
      {/* Category Dropdown */}
      {showCategoryModal && (
        <TouchableWithoutFeedback onPress={closeCategoryModal}>
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
            <Animated.View
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                top: categoryY + categoryHeight,
                backgroundColor: "#fff",
                borderRadius: 12,
                overflow: "hidden",
                transform: [
                  {
                    scaleY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                  },
                ],
                opacity: slideAnim,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              {["Electronics", "Fashion", "Books", "Toys", "Groceries"].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={{ paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}
                  onPress={() => {
                    setCategory(cat);
                    closeCategoryModal();
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}
  
      <View style={{ height: 12 }} />
      <Text style={[styles.header, { fontSize: 18 }]}>Your Recent Products</Text>
  
      {products.map((p) => (
        <View key={p.id} style={styles.modernProductRow}>
          <Image source={{ uri: p.imageUrl || "https://placekitten.com/200/200" }} style={styles.modernProductThumb} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontWeight: "700", fontSize: 16 }}>{p.name}</Text>
            <Text style={{ color: "#777", marginTop: 2 }}>{p.category} • {p.price}</Text>
            <Text style={{ color: "#555", marginTop: 4 }}>Likes: {p.likes}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
  
  const MessagesView = () => (
    <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 120 }}>
      <Text style={styles.header}>Messages</Text>
      {messages.length === 0 ? <Text style={{ color: "#777" }}>No messages</Text> : (
        messages.map((m) => (
          <View key={m.id} style={styles.messageRow}>
            <View style={styles.messageAvatar}>
              <Text style={{ fontWeight: "700" }}>{m.from.split(" ").map(n => n[0]).join("").toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontWeight: "600" }}>{m.from}</Text>
              <Text style={{ color: "#555" }}>{m.text}</Text>
            </View>
            {m.unread && <View style={styles.unreadBadge}><Text style={{ color: "#fff", fontSize: 12 }}>New</Text></View>}
          </View>
        ))
      )}
    </ScrollView>
  );

  const HistoryView = () => (
    <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 120 }}>
      <Text style={styles.header}>Sales History</Text>
      {salesHistory.length === 0 ? <Text style={{ color: "#777" }}>No sales yet</Text> : salesHistory.map((s) => (
        <View key={s.id} style={styles.historyCard}>
          <Text style={styles.historyTitle}>{products.find(p => p.id === s.productId)?.name || "Product"}</Text>
          <View style={styles.historyRow}>
            <Text style={styles.historyLabel}>Buyer:</Text>
            <Text style={styles.historyValue}>{s.buyer}</Text>
          </View>
          <View style={styles.historyRow}>
            <Text style={styles.historyLabel}>Amount:</Text>
            <Text style={styles.historyValue}>{s.amount}</Text>
          </View>
          <View style={styles.historyRow}>
            <Text style={styles.historyLabel}>Status:</Text>
            <Text style={styles.historyValue}>{s.status}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const NotificationsView = () => (
    <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 120 }}>
      <Text style={styles.header}>Notifications</Text>
      {notifications.length === 0 ? <Text style={{ color: "#777" }}>No notifications</Text> : notifications.map((n) => (
        <TouchableOpacity key={n.id} style={[styles.notificationRow, n.read ? {} : { backgroundColor: "#fffaf0" }]} onPress={() => markNotificationRead(n.id)}>
          <Text style={{ fontWeight: n.read ? "400" : "700" }}>{n.text}</Text>
          <Text style={{ color: "#777", fontSize: 12 }}>{new Date(n.time).toLocaleString()}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard": return <DashboardView />;
      case "Post": return <PostView />;
      case "Messages": return <MessagesView />;
      case "History": return <HistoryView />;
      case "Notifications": return <NotificationsView />;
      default: return <DashboardView />;
    }
  };

  const tabs = [
    { name: "Dashboard", icon: <Ionicons name="analytics" size={22} /> },
    { name: "Post", icon: <Ionicons name="add-circle" size={22} /> },
    { name: "Messages", icon: <Ionicons name="chatbubbles" size={22} /> },
    { name: "History", icon: <FontAwesome5 name="history" size={18} /> },
    { name: "Notifications", icon: <Ionicons name="notifications" size={22} /> },
  ];

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Image source={{ uri: "https://placekitten.com/200/200" }} style={styles.profilePic} />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontWeight: "700" }}>{shopName}</Text>
            <Text style={{ color: "#777", fontSize: 12 }}>Seller account</Text>
          </View>
        </View>

        <TouchableOpacity onPress={toggleMenu} style={styles.topRightTouchable}>
          <Ionicons name="ellipsis-vertical" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Slide menu overlay */}
      {menuVisible && (
        <View style={styles.menuOverlay}>
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={styles.overlayBg} />
          </TouchableWithoutFeedback>

          <Animated.View style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleSwitchRole("Buyer")}>
              <Text>Switch to Buyer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleSwitchRole("Transporter")}>
              <Text>Switch to Transporter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); setActiveTab("Profile"); }}>
              <Text>My shop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); console.log("Logout pressed"); }}>
              <Text>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Bottom Tabs */}
      <View style={styles.bottomTabBar}>
        {tabs.map((t) => (
          <TouchableOpacity key={t.name} style={styles.tabButton} onPress={() => setActiveTab(t.name)}>
            <View style={{ alignItems: "center" }}>
              {React.cloneElement(t.icon, { color: activeTab === t.name ? "#ff6f00" : "#777" })}
              <Text style={{ color: activeTab === t.name ? "#ff6f00" : "#777", fontSize: 12, marginTop: 4 }}>{t.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// --- MODERN STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    zIndex: 5,
  },
  topLeft: { flexDirection: "row", alignItems: "center" },
  profilePic: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#e5e7eb" },
  topRightTouchable: { padding: 6 },

  menuOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },
  overlayBg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)" },
  sideMenu: {
    position: "absolute",
    top: 70,
    right: 10,
    width: 230,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    zIndex: 1000,
  },
  menuItem: { paddingVertical: 14, paddingHorizontal: 14, borderBottomColor: "#f3f4f6", borderBottomWidth: 1 },

  content: { flex: 1 },

  dashboardContainer: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 16, color: "#111827" },
  panel: { backgroundColor: "#fff", padding: 14, borderRadius: 14, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  panelTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8, color: "#1f2937" },
  panelRow: { flexDirection: "row", marginBottom: 12 },
  smallNote: { color: "#6b7280", fontSize: 12, marginTop: 8 },
  bigStat: { fontSize: 32, fontWeight: "800", color: "#111827" },
  topSellerRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },

  formContainer: { padding: 16 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  button: { flex: 1, padding: 14, borderRadius: 12, marginHorizontal: 6, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  modernProductRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  modernProductThumb: { width: 80, height: 80, borderRadius: 12, backgroundColor: "#f3f4f6" },

  listingRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },

  bottomTabBar: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#e5e7eb", backgroundColor: "#fff" },
  tabButton: { flex: 1, alignItems: "center" },

  messageRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomColor: "#f3f4f6", borderBottomWidth: 1 },
  messageAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#e5e7eb", justifyContent: "center", alignItems: "center" },
  unreadBadge: { backgroundColor: "#ef4444", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },

  historyCard: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 12, elevation: 1 },
  historyTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10, color: "#1f2937" },
  historyRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  historyLabel: { fontWeight: "600", color: "#374151" },
  historyValue: { color: "#111827" },

  notificationRow: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
});
