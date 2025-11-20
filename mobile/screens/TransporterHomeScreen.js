// screens/TransporterHomeScreen.js
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { LineChart, BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;
/*
 TransporterHomeScreen
 - Full UI-only transporter workflow prototype (not backend)
 - Tabs: Available | My Parcels | Notifications | History | Profile
 - Competitive claiming / confirm modal
 - Nearest depot filtering
 - QR scan (simulated) -> show buyer info + map + delivery point
 - Start Delivery -> progress simulation
 - Chat / messages (GUI only)
 - Buyer confirmation & rating flow (simulated)
*/

const DEPOTS = [
  { id: "D1", name: "Depot A", lat: -13.9626, lon: 33.7741 },
  { id: "D2", name: "Depot B", lat: -15.3875, lon: 35.3229 },
  { id: "D3", name: "Depot C", lat: -14.0000, lon: 34.0000 },
];

// some sample parcels pre-created after payment (qrData simulating seller-created QR)
const INITIAL_PARCELS = [
  {
    id: "P-1001",
    title: "Fresh Veg Box",
    buyerName: "John M",
    buyerPhone: "+265 88 100 200",
    buyerAddress: "123 Market Rd, Lilongwe",
    buyerCoords: { lat: -13.9620, lon: 33.7750 },
    transportType: "bike", // type registered by transporter
    weightKg: 12,
    depotAssigned: null, // calculated as nearest depot
    status: "ready", // ready, competing, claimed, atDepot, inTransit, delivered
    claimedBy: null, // transporter id
    qrData: null, // will be simulated
    deliveryFee: 1200,
    chat: [], // messages between transporter and buyer
    progress: 0, // delivery progress %
    ratingByBuyer: null, // after delivered
    createdAt: Date.now(),
  },
  {
    id: "P-1002",
    title: "Smartphone Order",
    buyerName: "Sarah K",
    buyerPhone: "+265 88 200 300",
    buyerAddress: "22 Tech Ave, Blantyre",
    buyerCoords: { lat: -15.3875, lon: 35.3229 },
    transportType: "truck",
    weightKg: 3,
    depotAssigned: null,
    status: "ready",
    claimedBy: null,
    qrData: null,
    deliveryFee: 800,
    chat: [],
    progress: 0,
    ratingByBuyer: null,
    createdAt: Date.now(),
  },
  {
    id: "P-1003",
    title: "Shoe Delivery",
    buyerName: "Alice P",
    buyerPhone: "+265 99 444 555",
    buyerAddress: "7 Fashion St, Zomba",
    buyerCoords: { lat: -15.3830, lon: 35.3200 },
    transportType: "bike",
    weightKg: 1.2,
    depotAssigned: null,
    status: "ready",
    claimedBy: null,
    qrData: null,
    deliveryFee: 3500,
    chat: [],
    progress: 0,
    ratingByBuyer: null,
    createdAt: Date.now(),
  },
];

// Mock data for the new "Top Transporters" panel
const TOP_TRANSPORTERS_WEEK = [
  { id: "T-9002", name: "Zoom Logistics", rating: 4.9, deliveries: 25 },
  { id: "T-9001", name: "Michael Transport", rating: 4.8, deliveries: 22 }, // This is the current user
  { id: "T-9003", name: "Rapid Rides", rating: 4.7, deliveries: 30 },
];

// simple distance (approx) for nearest-depot calc (not precise, fine for demo)
const distSq = (a, b) => (a.lat - b.lat) ** 2 + (a.lon - b.lon) ** 2;

export default function TransporterHomeScreen({ navigation, setIsLoggedIn }) {
  // transporter profile (pretend this is loaded from auth)
  const [transporter] = useState({
    id: "T-9001",
    name: "Michael Transport",
    type: "bike", // this determines which parcels he receives
    location: { lat: -13.9625, lon: 33.7740 }, // base location
    assignedDepot: "D1",
  });

  // app state
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [parcels, setParcels] = useState(() => {
    // initialize parcels and compute nearest depot + qrData simulated
    return INITIAL_PARCELS.map((p) => {
      const depot = DEPOTS.reduce((acc, d) => (distSq(p.buyerCoords, d) < distSq(p.buyerCoords, acc) ? d : acc), DEPOTS[0]);
      return {
        ...p,
        depotAssigned: depot.id,
        qrData: {
          id: `QR-${p.id}`,
          mapLink: `MAP://to/${p.buyerCoords.lat},${p.buyerCoords.lon}`,
          buyerName: p.buyerName,
          buyerPhone: p.buyerPhone,
          buyerAddress: p.buyerAddress,
          parcelId: p.id,
          generatedAt: Date.now(),
        },
      };
    });
  });

  const [myParcels, setMyParcels] = useState([]); // parcels assigned/taken by this transporter
  const [notifications, setNotifications] = useState([
    // Add a mock "late" notification to demonstrate the new feature
    { id: `N-LATE-${Date.now()}`, type: 'late_queue_check', text: `Delivery for P-1003 seems delayed. Are you in a queue?`, parcelId: 'P-1003', time: Date.now() - 1000 * 60 * 5 },
    { id: `N-WELCOME-${Date.now()}`, type: 'text', text: 'Welcome to your dashboard, Michael!', time: Date.now() - 1000 * 60 * 60 },
  ]);
  const [history, setHistory] = useState([]); // delivered parcels
  // UI modals & helpers
  const [competingParcel, setCompetingParcel] = useState(null); // parcel under competition
  const [competeCountdown, setCompeteCountdown] = useState(6);
  const competeRef = useRef(null);
  const [showCompeteModal, setShowCompeteModal] = useState(false);

  const [qrModalParcel, setQrModalParcel] = useState(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const [chatParcel, setChatParcel] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatText, setChatText] = useState("");

  const [deliveryConfirmParcel, setDeliveryConfirmParcel] = useState(null);
  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);

  const [ratingModalParcel, setRatingModalParcel] = useState(null);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [buyerRating, setBuyerRating] = useState("");
  // Menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnim = useRef(new Animated.Value(250)).current;


  // convenience: show only parcels that belong to this transporter's depot and type (simulate nearest-depot notifications)
  const availableParcelsForMe = parcels.filter(
    (p) => p.status === "ready" && p.transportType === transporter.type && p.depotAssigned === transporter.assignedDepot
  );

  // helper: push a notification
  const pushNotif = (title) => {
    setNotifications((prev) => [{ id: `N-${Date.now()}`, text: title, time: Date.now() }, ...prev]);
  };

  // COMPETITIVE GRAB LOGIC
  // When transporter taps "Compete", a 6-second window opens. If they press Confirm before timeout, they get it.
  // If they don't confirm, a simulated competitor may grab it.
  const startCompete = (parcel) => {
    if (parcel.status !== "ready") {
      Alert.alert("Not available", "This parcel is no longer available.");
      return;
    }
    setCompetingParcel(parcel);
    setCompeteCountdown(6);
    setShowCompeteModal(true);

    competeRef.current = setInterval(() => {
      setCompeteCountdown((c) => {
        if (c <= 1) {
          clearInterval(competeRef.current);
          // decide winner: small chance simulated competitor wins
          const competitorWins = Math.random() < 0.45; // 45% chance competitor beats you if you didn't confirm
          if (competitorWins) {
            // mark parcel taken by 'other'
            setParcels((prev) => prev.map((p) => (p.id === parcel.id ? { ...p, status: "claimed", claimedBy: "other" } : p)));
            pushNotif(`Parcel ${parcel.id} taken by another transporter.`);
            setShowCompeteModal(false);
            setCompetingParcel(null);
          } else {
            // remains ready (you still have chance to confirm by pressing confirm quickly)
            setShowCompeteModal(false);
            setCompetingParcel(null);
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const confirmCompete = () => {
    if (!competingParcel) return;
    clearInterval(competeRef.current);
    // mark parcel claimed by this transporter
    setParcels((prev) => prev.map((p) => (p.id === competingParcel.id ? { ...p, status: "claimed", claimedBy: transporter.id } : p)));
    setMyParcels((prev) => [{ ...competingParcel, status: "claimed", claimedBy: transporter.id }, ...prev]);
    pushNotif(`You claimed ${competingParcel.id}. Proceed to depot to scan QR.`);
    setShowCompeteModal(false);
    setCompetingParcel(null);
  };

  // SCAN AT DEPOT -> when transporter reaches depot they scan QR and get parcel details (simulate)
  const openQrModal = (parcel) => {
    // only allow scan if parcel is claimed by this transporter or status 'claimed' with claimedBy = transporter.id
    if (parcel.claimedBy !== transporter.id && parcel.status !== "claimed") {
      Alert.alert("Cannot scan", "You need to claim this parcel first.");
      return;
    }
    setQrModalParcel(parcel);
    setQrModalVisible(true);
  };

  const scanAndStartDelivery = (parcel) => {
    // mark the parcel as atDepot -> then inTransit
    setParcels((prev) => prev.map((p) => (p.id === parcel.id ? { ...p, status: "inTransit", claimedBy: transporter.id } : p)));
    setMyParcels((prev) => prev.map((p) => (p.id === parcel.id ? { ...p, status: "inTransit" } : p)));
    setQrModalVisible(false);
    pushNotif(`You started delivery for ${parcel.id}. Buyer notified.`);
    // simulate notifying buyer (GUI only)
    addChatMessage(parcel.id, { sender: "system", text: `Transporter ${transporter.name} is en-route.` });
    // start progress simulation
    startProgressSimulation(parcel.id);
  };

  // progress simulation: increment parcel.progress every second until 90, then wait for transporter to mark delivered
  const startProgressSimulation = (parcelId) => {
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.round(5 + Math.random() * 6); // approx 5-11% per sec
      if (progress >= 90) {
        progress = 90;
        // update once then stop auto-increment
        setParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, progress } : p)));
        setMyParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, progress } : p)));
        clearInterval(progressInterval);
        return;
      }
      setParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, progress } : p)));
      setMyParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, progress } : p)));
    }, 1000);

    // store reference on parcel in case we want to clear (not strictly necessary for demo)
  };

  // MARK DELIVERED (transporter taps 'Mark as delivered' -> will open a confirm which simulates buyer confirmation flow)
  const markDelivered = (parcel) => {
    setDeliveryConfirmParcel(parcel);
    setDeliveryModalVisible(true);
  };

  const confirmDeliveredByTransporter = () => {
    if (!deliveryConfirmParcel) return;
    // set status to delivered locally and push to history and ask for buyer rating simulation
    setParcels((prev) => prev.map((p) => (p.id === deliveryConfirmParcel.id ? { ...p, status: "delivered", progress: 100 } : p)));
    setMyParcels((prev) => prev.map((p) => (p.id === deliveryConfirmParcel.id ? { ...p, status: "delivered", progress: 100 } : p)));
    setHistory((prev) => [{ ...deliveryConfirmParcel, status: "delivered", deliveredAt: Date.now() }, ...prev]);
    pushNotif(`Parcel ${deliveryConfirmParcel.id} delivered. Waiting for buyer confirmation & rating.`);
    // open rating modal to simulate buyer rating
    setRatingModalParcel(deliveryConfirmParcel);
    setRatingModalVisible(true);
    setDeliveryModalVisible(false);
  };

  const submitBuyerRating = () => {
    if (!ratingModalParcel) return;
    const rating = Number(buyerRating) || 5;
    setParcels((prev) => prev.map((p) => (p.id === ratingModalParcel.id ? { ...p, ratingByBuyer: rating } : p)));
    setMyParcels((prev) => prev.map((p) => (p.id === ratingModalParcel.id ? { ...p, ratingByBuyer: rating } : p)));
    setHistory((prev) => prev.map((h) => (h.id === ratingModalParcel.id ? { ...h, ratingByBuyer: rating } : h)));
    pushNotif(`Buyer rated parcel ${ratingModalParcel.id} ${rating} ★`);
    pushNotif(`Your overall rating may have changed.`);
    setRatingModalVisible(false);
    setBuyerRating("");
    setRatingModalParcel(null);
  };

  // CHAT: append message to parcel.chat
  const addChatMessage = (parcelId, message) => {
    setParcels((prev) =>
      prev.map((p) => (p.id === parcelId ? { ...p, chat: [...(p.chat || []), { ...message, time: Date.now() }] } : p))
    );
    setMyParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, chat: [...(p.chat || []), { ...message, time: Date.now() }] } : p)));
  };

  const openChat = (parcel) => {
    setChatParcel(parcel);
    setChatVisible(true);
  };

  const sendChat = () => {
    if (!chatText.trim() || !chatParcel) return;
    addChatMessage(chatParcel.id, { sender: transporter.name, text: chatText });
    setChatText("");
    // simulate buyer reply with slight delay
    setTimeout(() => {
      // Also push a notification for the new message
      pushNotif(`New message from ${chatParcel.buyerName} regarding parcel ${chatParcel.id}`);
      addChatMessage(chatParcel.id, { sender: chatParcel.buyerName, text: "Thanks — noted!", time: Date.now() });
    }, 1500);
  };

  // Handle the response to the "Are you in a queue?" notification
  const handleQueueResponse = (notificationId, parcelId, response) => {
    if (response === 'yes') {
      // Replace the question notification with a map notification
      setNotifications(prev => [
        { id: `N-MAP-${parcelId}`, type: 'map_route', parcelId: parcelId, time: Date.now() },
        ...prev.filter(n => n.id !== notificationId)
      ]);
      pushNotif(`Heavy traffic reported on your route for parcel ${parcelId}.`);
    } else {
      // Just remove the notification if they tap "No"
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      pushNotif(`Noted. Please proceed with caution on parcel ${parcelId}.`);
    }
  };

  // --- Menu Handlers ---
  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(menuAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start();
  };

  const closeMenu = () => {
    Animated.timing(menuAnim, { toValue: 250, duration: 200, useNativeDriver: true }).start(() => {
      setMenuVisible(false);
    });
  };

  const handleSwitchRole = (role) => {
    closeMenu();
    if (role === 'Buyer') {
      // Set isLoggedIn to true to switch to the buyer stack
      setIsLoggedIn(true);
    } else if (role === 'Seller') {
      navigation.replace('SellerHome');
    }
  };

  const handleLogout = () => {
    closeMenu();
    navigation.replace('Welcome');
  };
  // UI helpers
  useEffect(() => {
    return () => clearInterval(competeRef.current);
  }, []);

  // --- DASHBOARD DATA COMPUTATION ---
  const computeDashboardStats = () => {
    const totalEarnings = history.reduce((sum, p) => sum + (p.deliveryFee || 0), 0);
    const totalDeliveries = history.length;
    const ratedDeliveries = history.filter(p => p.ratingByBuyer);
    const avgRating = ratedDeliveries.length > 0
      ? (ratedDeliveries.reduce((sum, p) => sum + p.ratingByBuyer, 0) / ratedDeliveries.length).toFixed(1)
      : "N/A";
    return { totalEarnings, totalDeliveries, avgRating };
  };

  const computeEarningsChart = () => {
    // Dummy data for the last 6 months
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const data = [
      Math.random() * 5000,
      Math.random() * 8000,
      Math.random() * 6000,
      Math.random() * 9000,
      Math.random() * 7500,
      history.reduce((sum, p) => sum + (p.deliveryFee || 0), 0), // Current month earnings
    ].map(d => Math.round(d / 100) * 100);
    return { labels, datasets: [{ data }] };
  };

  const computeLocationChart = () => {
    const locationCounts = history.reduce((acc, p) => {
      const city = p.buyerAddress.split(',').pop().trim();
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(locationCounts);
    if (labels.length === 0) return { labels: ["N/A"], datasets: [{ data: [0] }] };
    
    const data = Object.values(locationCounts);
    return { labels, datasets: [{ data }] };
  };

  // --- RENDERERS ---

  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`, // blue color
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`, // gray color
    style: {
      borderRadius: 16,
    },
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#1d4ed8" },
  };

  const DashboardView = () => {
    const stats = computeDashboardStats();
    const earningsData = computeEarningsChart();
    const locationData = computeLocationChart();

    return (
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 100 }}>
        <Text style={styles.dashboardHeader}>Your Dashboard</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}><Text style={styles.statValue}>MWK {stats.totalEarnings.toLocaleString()}</Text><Text style={styles.statLabel}>Total Earnings</Text></View>
          <View style={styles.statCard}><Text style={styles.statValue}>{stats.totalDeliveries}</Text><Text style={styles.statLabel}>Deliveries</Text></View>
          <View style={styles.statCard}><Text style={styles.statValue}>{stats.avgRating} ★</Text><Text style={styles.statLabel}>Avg. Rating</Text></View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Monthly Earnings</Text>
          <LineChart data={earningsData} width={screenWidth - 56} height={200} yAxisLabel="MWK " yAxisSuffix="k" yAxisInterval={1} chartConfig={chartConfig} bezier style={{ borderRadius: 16 }} formatYLabel={(y) => `${Math.round(parseFloat(y) / 1000)}`} />
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Deliveries by Location</Text>
          <BarChart data={locationData} width={screenWidth - 56} height={220} yAxisLabel="" chartConfig={chartConfig} verticalLabelRotation={30} fromZero />
        </View>

        {/* Top Transporters Panel */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Top Transporters of the Week</Text>
          {TOP_TRANSPORTERS_WEEK.map((t, index) => (
            <View key={t.id} style={[styles.transporterRow, t.id === transporter.id && styles.currentUserRow]}>
              <Text style={styles.rankText}>{index + 1}</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.transporterName}>{t.name}</Text>
                <Text style={styles.transporterDeliveries}>{t.deliveries} deliveries</Text>
              </View>
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name="star"
                    size={16}
                    color={i < Math.round(t.rating) ? "#ffc107" : "#e0e0e0"}
                  />
                ))}
                <Text style={styles.ratingText}>{t.rating.toFixed(1)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // RENDERERS
  const renderAvailable = ({ item }) => {
    // only show parcels for this transporter's type & depot (they represent "notifications")
    if (item.transportType !== transporter.type || item.depotAssigned !== transporter.assignedDepot) return null;
    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.badge}>{item.transportType.toUpperCase()}</Text>
        </View>
        <Text style={styles.small}>Parcel ID: {item.id}</Text>
        <Text style={styles.small}>Buyer: {item.buyerName} • {item.buyerPhone}</Text>
        <Text style={styles.small}>Depot: {item.depotAssigned}</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => startCompete(item)}>
            <Text style={styles.primaryBtnText}>Compete (grab)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={() => openChat(item)}>
            <Text style={styles.ghostBtnText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMyParcel = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={[styles.statusPill, item.status === "inTransit" ? styles.inTransit : item.status === "delivered" ? styles.delivered : styles.claimed]}>
            {item.status.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.small}>ID: {item.id}</Text>
        <Text style={styles.small}>Buyer: {item.buyerName} • {item.buyerPhone}</Text>
        <Text style={styles.small}>Depot: {item.depotAssigned}</Text>

        <View style={{ height: 8 }} />
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFg, { width: `${Math.min(item.progress || 0, 100)}%` }]} />
        </View>
        <Text style={styles.small}>{(item.progress || 0).toFixed(0)}% complete</Text>

        <View style={styles.row}>
          {item.status === "claimed" && item.claimedBy === transporter.id && (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => openQrModal(item)}>
              <Text style={styles.primaryBtnText}>Scan QR at Depot</Text>
            </TouchableOpacity>
          )}

          {item.status === "inTransit" && (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => markDelivered(item)}>
                <Text style={styles.primaryBtnText}>Mark Delivered</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => openChat(item)}>
                <Text style={styles.ghostBtnText}>Chat</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === "delivered" && (
            <>
              <Text style={{ alignSelf: "center", marginLeft: 8 }}>Delivered • Rating: {item.ratingByBuyer ?? "—"}</Text>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => openChat(item)}>
                <Text style={styles.ghostBtnText}>Chat</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderNotif = ({ item }) => {
    switch (item.type) {
      case 'late_queue_check':
        return (
          <View style={[styles.notificationRow, { backgroundColor: '#fffbe6' }]}>
            <Ionicons name="warning-outline" size={24} color="#f59e0b" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#92400e", fontWeight: "bold" }}>Delivery Delayed?</Text>
              <Text style={{ color: "#92400e", marginTop: 4 }}>{item.text}</Text>
              <View style={{ flexDirection: 'row', marginTop: 12 }}>
                <TouchableOpacity
                  style={[styles.notifButton, { backgroundColor: '#16a34a' }]}
                  onPress={() => handleQueueResponse(item.id, item.parcelId, 'yes')}
                >
                  <Text style={styles.notifButtonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.notifButton, { backgroundColor: '#dc2626', marginLeft: 10 }]}
                  onPress={() => handleQueueResponse(item.id, item.parcelId, 'no')}
                >
                  <Text style={styles.notifButtonText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 'map_route':
        const parcel = myParcels.find(p => p.id === item.parcelId) || parcels.find(p => p.id === item.parcelId);
        if (!parcel) return null;
        return (
          <View style={styles.mapNotificationCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.mapNotifTitle}>New Route Suggested</Text>
              <Text style={styles.small}>Parcel: {parcel.id}</Text>
            </View>
            <Text style={styles.mapNotifSubtitle}>Heavy traffic reported. Consider the alternative route shown in green.</Text>

            {/* Mock Map */}
            <View style={styles.mapContainer}>
              {/* Routes */}
              <View style={styles.originalRoute} />
              <View style={styles.newRoute} />

              {/* Markers */}
              <View style={[styles.mapMarker, { top: '80%', left: '10%' }]}>
                <FontAwesome5 name="warehouse" size={16} color="#fff" />
                <Text style={styles.markerLabel}>Depot</Text>
              </View>
              <View style={[styles.mapMarker, { top: '15%', left: '80%', backgroundColor: '#16a34a' }]}>
                <Ionicons name="home" size={16} color="#fff" />
                <Text style={styles.markerLabel}>Buyer</Text>
              </View>
              <View style={[styles.mapMarker, { top: '40%', left: '45%', backgroundColor: '#ef4444', width: 24, height: 24, borderRadius: 12 }]}>
                <Ionicons name="car-crash" size={12} color="#fff" />
              </View>

              {/* Your Location */}
              <Animated.View style={[styles.yourLocationMarker, { top: `${100 - (parcel.progress || 5)}%`, left: `${(parcel.progress || 5)}%` }]}>
                <Ionicons name="bicycle" size={18} color="#fff" />
              </Animated.View>
            </View>

            {/* Progress Bar */}
            <View style={{ marginTop: 12 }}>
              <Text style={styles.small}>Delivery Progress: {(parcel.progress || 0).toFixed(0)}%</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFg, { width: `${Math.min(parcel.progress || 0, 100)}%` }]} />
              </View>
            </View>
          </View>
        );
      default: // 'text' notification
        return (
          <View style={styles.notificationRow}>
            <View style={styles.notifIconCircle}>
              <Ionicons
                name={item.text.toLowerCase().includes('rated') ? "star-outline" : "information-outline"}
                size={20}
                color="#2563eb"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#111", fontWeight: "600" }}>{item.text}</Text>
              <Text style={{ color: "#777", fontSize: 12, marginTop: 2 }}>{new Date(item.time).toLocaleTimeString()}</Text>
            </View>
          </View>
        );
    }
  };

  const renderHistory = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.small}>ID: {item.id}</Text>
      <Text style={styles.small}>Delivered At: {new Date(item.deliveredAt || Date.now()).toLocaleString()}</Text>
      <Text style={styles.small}>Rating: {item.ratingByBuyer ?? "—"}</Text>
    </View>
  );

  // Main UI
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fc" }}>
  {/* HEADER */}
  <View style={styles.header}>
    <View style={{ flex: 1 }}>
      <Text style={styles.headerTitle}>{transporter.name}</Text>
      <Text style={styles.headerSub}>{transporter.type.toUpperCase()} • Depot {transporter.assignedDepot}</Text>
    </View>

    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity onPress={() => setActiveTab('Profile')} style={{ marginRight: 8 }}>
        <Ionicons name="person-circle" size={34} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={openMenu}>
        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>

  {/* CONTENT */}
  <View style={{ flex: 1, padding: 12 }}>
    {activeTab === "Dashboard" && (
      <DashboardView />
    )}

    {activeTab === "Available" && (
      <FlatList
        data={availableParcelsForMe}
        keyExtractor={(i) => i.id}
        renderItem={renderAvailable}
        ListEmptyComponent={<Text style={styles.placeholder}>No parcels currently notifying your depot/type.</Text>}
      />
    )}

    {activeTab === "My Parcels" && (
      <FlatList
        data={myParcels}
        keyExtractor={(i) => i.id}
        renderItem={renderMyParcel}
        ListEmptyComponent={<Text style={styles.placeholder}>You have not claimed any parcels yet.</Text>}
      />
    )}

    {activeTab === "Notifications" && (
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        renderItem={renderNotif}
        ListEmptyComponent={<Text style={styles.placeholder}>No notifications yet.</Text>}
      />
    )}

    {activeTab === "History" && (
      <FlatList
        data={history}
        keyExtractor={(i) => i.id}
        renderItem={renderHistory}
        ListEmptyComponent={<Text style={styles.placeholder}>No delivered parcels yet.</Text>}
      />
    )}

    {activeTab === "Profile" && (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.profileBox}>
          <Text style={styles.profileTitle}>{transporter.name}</Text>
          <Text style={styles.small}>Type: {transporter.type}</Text>
          <Text style={styles.small}>Depot: {transporter.assignedDepot}</Text>
          <Text style={styles.small}>Phone: +265 88 777 000</Text>

          <View style={{ height: 16 }} />

          <TouchableOpacity style={styles.primaryBtn} onPress={() => Alert.alert("Settings", "Open settings placeholder")}>
            <Text style={styles.primaryBtnText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.ghostBtn, { marginTop: 12 }]} onPress={() => Alert.alert("Logout", "Simulated logout")}>
            <Text style={styles.ghostBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )}
  </View>

  <SafeAreaView style={[styles.tabbar, { backgroundColor: "#fff" }]}>
  {[
    { name: "Dashboard", icon: "stats-chart-outline" },
    { name: "Available", icon: "cube-outline" },
    { name: "My Parcels", icon: "bicycle-outline" },
    { name: "Notifications", icon: "notifications-outline" },
    { name: "History", icon: "time-outline" },
    { name: "Profile", icon: "person-circle-outline" },
  ].map((t) => (
    <TouchableOpacity
      key={t.name}
      style={[styles.tabItem, activeTab === t.name && styles.tabActive]}
      onPress={() => setActiveTab(t.name)}
    >
      <Ionicons
        name={t.icon}
        size={24}
        color={activeTab === t.name ? "#2563eb" : "#6b7280"}
      />
      <Text
        style={[
          styles.tabText,
          activeTab === t.name && styles.tabTextActive,
        ]}
      >
        {t.name}
      </Text>
    </TouchableOpacity>
  ))}
</SafeAreaView>

      {/* Slide menu overlay */}
      {menuVisible && (
        <View style={styles.menuOverlay}>
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={styles.overlayBg} />
          </TouchableWithoutFeedback>

          <Animated.View style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleSwitchRole("Buyer")}>
              <Text style={styles.menuItemText}>Switch to Buyer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleSwitchRole("Seller")}>
              <Text style={styles.menuItemText}>Switch to Seller</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, { borderBottomWidth: 0 }]} 
              onPress={handleLogout}>
              <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}




      {/* COMPETE MODAL */}
      <Modal visible={showCompeteModal} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Competitive Grab</Text>
            <Text style={styles.small}>Parcel: {competingParcel?.id} — {competingParcel?.title}</Text>
            <Text style={{ marginTop: 8, fontSize: 16 }}>Confirm within: {competeCountdown}s</Text>

            <View style={{ height: 12 }} />
            <View style={styles.row}>
              <TouchableOpacity style={styles.primaryBtn} onPress={confirmCompete}>
                <Text style={styles.primaryBtnText}>Confirm & Take</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => { clearInterval(competeRef.current); setShowCompeteModal(false); setCompetingParcel(null); }}>
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 10 }} />
            <Text style={styles.small}>Tip: Confirm fast — simulated competitors may take it.</Text>
          </View>
        </View>
      </Modal>

      {/* QR Modal */}
      <Modal visible={qrModalVisible} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modalCardLarge}>
            <Text style={styles.modalTitle}>Scan QR — Parcel {qrModalParcel?.id}</Text>
            <View style={{ marginTop: 8 }}>
              <Text style={styles.small}><Text style={{ fontWeight: "700" }}>Buyer:</Text> {qrModalParcel?.buyerName}</Text>
              <Text style={styles.small}><Text style={{ fontWeight: "700" }}>Phone:</Text> {qrModalParcel?.buyerPhone}</Text>
              <Text style={styles.small}><Text style={{ fontWeight: "700" }}>Address:</Text> {qrModalParcel?.buyerAddress}</Text>
              <Text style={styles.small}><Text style={{ fontWeight: "700" }}>Map:</Text> {qrModalParcel?.qrData?.mapLink}</Text>
              <Text style={styles.small}><Text style={{ fontWeight: "700" }}>QR ID:</Text> {qrModalParcel?.qrData?.id}</Text>
            </View>

            <View style={{ height: 12 }} />
            <View style={styles.row}>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => scanAndStartDelivery(qrModalParcel)}>
                <Text style={styles.primaryBtnText}>Scan & Start Delivery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => setQrModalVisible(false)}>
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DELIVERY CONFIRMATION */}
      <Modal visible={deliveryModalVisible} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Delivery</Text>
            <Text style={styles.small}>Parcel: {deliveryConfirmParcel?.id} • {deliveryConfirmParcel?.title}</Text>

            <View style={{ height: 12 }} />
            <View style={styles.row}>
              <TouchableOpacity style={styles.primaryBtn} onPress={confirmDeliveredByTransporter}>
                <Text style={styles.primaryBtnText}>Yes — Delivered</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => setDeliveryModalVisible(false)}>
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* RATING MODAL (simulate buyer rating) */}
      <Modal visible={ratingModalVisible} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Buyer Rating (simulate)</Text>
            <Text style={styles.small}>Parcel: {ratingModalParcel?.id}</Text>
            <TextInput
              placeholder="Buyer rate seller (1-5)"
              keyboardType="numeric"
              value={buyerRating}
              onChangeText={setBuyerRating}
              style={styles.input}
            />
            <View style={styles.row}>
              <TouchableOpacity style={styles.primaryBtn} onPress={submitBuyerRating}>
                <Text style={styles.primaryBtnText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => { setRatingModalVisible(false); setBuyerRating(""); }}>
                <Text style={styles.ghostBtnText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CHAT MODAL */}
      <Modal visible={chatVisible} transparent animationType="slide">
        <View style={styles.chatWrap}>
          <View style={styles.chatCard}>
            <View style={styles.rowBetween}>
              <Text style={{ fontWeight: "700" }}>Chat with {chatParcel?.buyerName}</Text>
              <TouchableOpacity onPress={() => setChatVisible(false)}><Ionicons name="close" size={22} /></TouchableOpacity>
            </View>
            <ScrollView style={{ marginVertical: 12, maxHeight: 300 }}>
              {(chatParcel?.chat || []).map((m, idx) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: "#666" }}>{m.sender} • {new Date(m.time).toLocaleTimeString()}</Text>
                  <Text style={{ fontSize: 14 }}>{m.text}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.row}>
              <TextInput value={chatText} onChangeText={setChatText} placeholder="Type a message..." style={[styles.input, { flex: 1 }]} />
              <TouchableOpacity style={[styles.primaryBtn, { marginLeft: 8 }]} onPress={sendChat}>
                <Text style={styles.primaryBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fc" },

  header: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  headerSub: { color: "#dbeafe", fontSize: 12 },

  // Dashboard Styles
  dashboardHeader: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#2563eb' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  chartTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  transporterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  currentUserRow: { backgroundColor: '#eef2ff', marginHorizontal: -16, paddingHorizontal: 16 },
  rankText: { fontSize: 16, fontWeight: 'bold', color: '#6b7280', width: 20 },
  transporterName: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  transporterDeliveries: { fontSize: 12, color: '#6b7280' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 6, fontSize: 14, fontWeight: 'bold', color: '#374151' },

  tabbar: { flexDirection: "row", backgroundColor: "#fff", elevation: 2 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 3, borderBottomColor: "#2563eb" },
  tabText: { color: "#6b7280", fontWeight: "600" },
  tabTextActive: { color: "#2563eb" },

  content: { flex: 1, padding: 12 },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  row: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  cardTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  small: { color: "#6b7280", fontSize: 13, marginTop: 4 },

  primaryBtn: { backgroundColor: "#2563eb", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  ghostBtn: { borderWidth: 1, borderColor: "#e6e9f2", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginLeft: 8 },
  ghostBtnText: { color: "#333", fontWeight: "700" },

  badge: { backgroundColor: "#eef2ff", color: "#1e3a8a", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontWeight: "700" },

  placeholder: { color: "#9ca3af", textAlign: "center", marginTop: 28 },

  modalWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  modalCardLarge: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },

  notificationRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5 },
  notifIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  notifButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  notifButtonText: { color: '#fff', fontWeight: 'bold' },

  mapNotificationCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  mapNotifTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  mapNotifSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: 12 },
  mapContainer: { height: 180, backgroundColor: '#dbeafe', borderRadius: 12, overflow: 'hidden', position: 'relative' },
  mapMarker: { position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  markerLabel: { color: '#fff', fontSize: 8, fontWeight: 'bold', position: 'absolute', bottom: -10 },
  yourLocationMarker: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff', elevation: 4 },
  originalRoute: { position: 'absolute', top: '50%', left: '15%', width: '70%', height: 4, backgroundColor: '#ef4444', borderRadius: 2, transform: [{ rotate: '-20deg' }] },
  newRoute: {
    position: 'absolute',
    top: '60%',
    left: '15%',
    width: '80%',
    height: 4,
    backgroundColor: '#22c55e',
  },

  profileBox: { backgroundColor: "#fff", padding: 16, borderRadius: 12, elevation: 1 },

  progressBarBg: { height: 8, backgroundColor: "#eef2ff", borderRadius: 6, overflow: "hidden", marginTop: 8 },
  progressBarFg: { height: 8, backgroundColor: "#2563eb" },

  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, color: "#fff", fontWeight: "700" },
  claimed: { backgroundColor: "#f59e0b", color: "#fff" },
  inTransit: { backgroundColor: "#2563eb", color: "#fff" },
  delivered: { backgroundColor: "#10b981", color: "#fff" },

  input: { borderWidth: 1, borderColor: "#e6e9f2", borderRadius: 10, padding: 10, backgroundColor: "#fff" },

  chatWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 16 },
  chatCard: { backgroundColor: "#fff", borderRadius: 12, padding: 12, maxHeight: "80%" },

  // Menu Styles
  menuOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },
  overlayBg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)" },
  sideMenu: {
    position: "absolute",
    top: 60, // Adjust based on header height
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
  menuItemText: { fontSize: 16, color: '#374151' },


  bottomTabbar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: "#e6e9f2",
    paddingVertical: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  tabActive: {
    borderTopWidth: 3,
    borderTopColor: "#2563eb",
  },
  tabText: {
    color: "#6b7280",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#2563eb",
  },
  
});
